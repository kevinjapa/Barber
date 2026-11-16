"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PublicHeader, customerSessionKey, readCustomerSession, type CustomerSession } from "./PublicHeader";
import type { RewardPromotion } from "./types";

export function CustomerAccessPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ dni: "", name: "", last_name: "", email: "", phone: "", password: "", privacy_consent: false });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (field: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (mode === "register" && !form.privacy_consent) throw new Error("Debes aceptar el aviso de privacidad.");
      const response = await fetch(mode === "login" ? "/api/public/account/login" : "/api/public/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(mode === "login" ? { email: form.email, password: form.password } : form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail ?? "No se pudo completar la operación.");
      window.localStorage.setItem(customerSessionKey, JSON.stringify(result));
      router.push("/perfil");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo completar la operación.");
    } finally {
      setSaving(false);
    }
  }

  return <main className="booking-shell min-h-screen"><div className="public-container"><PublicHeader /><section className="account-layout"><div><p className="booking-kicker">Tu cuenta Alva Academy</p><h1 className="font-serif text-5xl text-[#153e38]">Tu estilo, tus beneficios.</h1><p className="mt-5 max-w-lg leading-7 text-[#718078]">Inicia sesión para consultar tus puntos, tus reservas y tus beneficios.</p></div><form onSubmit={submit} className="booking-card p-7"><div className="flex gap-2 border-b border-[#e1e8e2] pb-4"><button type="button" onClick={() => setMode("login")} className={mode === "login" ? "account-tab-active" : "account-tab"}>Iniciar sesión</button><button type="button" onClick={() => setMode("register")} className={mode === "register" ? "account-tab-active" : "account-tab"}>Crear cuenta</button></div>{error && <p className="login-error mt-5 p-3 text-sm">{error}</p>}<div className="mt-6 space-y-4">{mode === "register" && <><label className="booking-label">Cédula<input required value={form.dni} onChange={(event) => update("dni", event.target.value)} className="booking-field mt-2 w-full" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="booking-label">Nombre<input required value={form.name} onChange={(event) => update("name", event.target.value)} className="booking-field mt-2 w-full" /></label><label className="booking-label">Apellido<input required value={form.last_name} onChange={(event) => update("last_name", event.target.value)} className="booking-field mt-2 w-full" /></label></div><label className="booking-label">Teléfono<input required value={form.phone} onChange={(event) => update("phone", event.target.value)} className="booking-field mt-2 w-full" /></label></>}<label className="booking-label">Correo electrónico<input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} className="booking-field mt-2 w-full" /></label><label className="booking-label">Contraseña<input required minLength={8} type="password" value={form.password} onChange={(event) => update("password", event.target.value)} className="booking-field mt-2 w-full" /></label>{mode === "register" && <label className="flex items-start gap-3 text-xs leading-5 text-[#65716b]"><input type="checkbox" checked={form.privacy_consent} onChange={(event) => update("privacy_consent", event.target.checked)} className="mt-1 accent-[#b97848]" />Acepto el aviso de privacidad.</label>}</div><button disabled={saving} className="booking-submit mt-7 w-full">{saving ? "Procesando..." : mode === "login" ? "Entrar a mi cuenta" : "Crear mi cuenta"}</button></form></section></div></main>;
}

type Rewards = { points: number; completed_appointments: number; promotions: RewardPromotion[] };
type CustomerAppointment = { appoid: number; date: string; start_time: string; end_time: string; status: string; description?: string; service_name?: string | null; service_price?: number | null; employee_name?: string | null; employee_last_name?: string | null };

function useRequiredCustomer() {
  const router = useRouter();
  const [session, setSession] = useState<CustomerSession | null>(null);
  useEffect(() => {
    const current = readCustomerSession();
    if (!current) router.replace("/acceso");
    else window.requestAnimationFrame(() => setSession(current));
  }, [router]);
  return session;
}

export function CustomerProfilePage() {
  const session = useRequiredCustomer();
  const [rewards, setRewards] = useState<Rewards>({ points: 0, completed_appointments: 0, promotions: [] });
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!session) return;
    void fetch(`/api/client/${session.clientid}/rewards`, {
      headers: { Authorization: `Bearer ${session.session_token ?? ""}` },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("No se pudieron cargar tus puntos y canjes.");
        setRewards(await response.json());
      })
      .catch((requestError: unknown) => setMessage(requestError instanceof Error ? requestError.message : "No se pudieron cargar tus puntos y canjes."));
  }, [session]);
  async function redeem(promotion: RewardPromotion) {
    if (!session) return;
    setMessage("");
    try {
      const response = await fetch(`/api/client/${session.clientid}/rewards/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.session_token ?? ""}`,
        },
        body: JSON.stringify({ promotionid: promotion.promotionid }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail ?? "No se pudo canjear.");
      setRewards((current) => ({ ...current, ...result }));
      setMessage(`Canje realizado: ${promotion.name}.`);
    } catch (redeemError) {
      setMessage(redeemError instanceof Error ? redeemError.message : "No se pudo canjear.");
    }
  }
  if (!session) return null;
  return (
    <main className="booking-shell min-h-screen">
      <div className="public-container">
        <PublicHeader />
        <section className="public-hero">
          <p className="booking-kicker">Mi cuenta</p>
          <h1>Hola, {session.name}.</h1>
          <p>Tus beneficios y tu experiencia, en un solo lugar.</p>
        </section>
        {message && <p className="border border-[#b8d0c4] bg-[#f0f8f2] p-4 text-sm text-[#37634f]">{message}</p>}
        <div className="account-stats">
          <article className="public-card p-7">
            <p className="booking-kicker">Puntos disponibles</p>
            <strong>{rewards.points}</strong>
            <p>Acumulados por servicios facturados.</p>
          </article>
          <article className="public-card p-7">
            <p className="booking-kicker">Servicios completados</p>
            <strong>{rewards.completed_appointments}</strong>
            <p>Cada servicio completado suma a tu progreso.</p>
          </article>
          <article className="public-card p-7">
            <p className="booking-kicker">Tu correo</p>
            <strong className="break-all text-2xl">{session.email}</strong>
            <p>Cuenta protegida y personalizada.</p>
          </article>
        </div>
        <section className="mt-8">
          <div className="home-section-heading">
            <h2>Canjes disponibles</h2>
            <span>{rewards.promotions.length} beneficios</span>
          </div>
          {rewards.promotions.length === 0 ? (
            <p className="py-6 text-[#718078]">Por ahora no hay promociones activas.</p>
          ) : (
            <div className="reservation-list">
              {rewards.promotions.map((promotion) => (
                <article className="public-card reservation-card" key={promotion.promotionid}>
                  <div>
                    <p className="booking-kicker">{promotion.points_required} puntos</p>
                    <h3>{promotion.name}</h3>
                    <p>{promotion.description || "Beneficio de la barbería"}</p>
                    {promotion.service_name && <p>Servicio: {promotion.service_name}</p>}
                  </div>
                  <div className="reservation-date">
                    <span>{rewards.points >= promotion.points_required ? "Disponible" : `Te faltan ${promotion.points_required - rewards.points} puntos`}</span>
                    <button
                      type="button"
                      disabled={rewards.points < promotion.points_required}
                      onClick={() => void redeem(promotion)}
                      className="booking-submit mt-3 disabled:opacity-50"
                    >
                      Canjear
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <div className="mt-8 flex gap-3">
          <a href="/reservas" className="booking-submit inline-block">Ver mis reservas</a>
          <a href="/reservar" className="action-secondary px-5 py-3 text-sm font-bold">Agendar una cita</a>
        </div>
      </div>
    </main>
  );
}

export function CustomerAppointmentsPage() {
  const session = useRequiredCustomer();
  const [appointments, setAppointments] = useState<CustomerAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!session) return;
    void fetch(`/api/public/account/${session.clientid}/appointments`, { headers: { Authorization: `Bearer ${session.session_token ?? ""}` } }).then(async (response) => {
      if (!response.ok) throw new Error("No se pudieron cargar tus reservas.");
      setAppointments(await response.json());
    }).catch((requestError) => setError(requestError instanceof Error ? requestError.message : "No se pudieron cargar tus reservas.")).finally(() => setLoading(false));
  }, [session]);
  if (!session) return null;
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = appointments.filter((appointment) => appointment.date.toString().slice(0, 10) >= today && appointment.status !== "F");
  const previous = appointments.filter((appointment) => !upcoming.includes(appointment));
  return <main className="booking-shell min-h-screen"><div className="public-container"><PublicHeader /><section className="public-hero"><p className="booking-kicker">Mi cuenta</p><h1>Mis reservas</h1><p>Consulta tus próximas citas y el historial de tus visitas.</p></section>{error && <p className="login-error mb-6 p-4 text-sm">{error}</p>}{loading ? <p className="text-[#bdb8ae]">Cargando reservas...</p> : <div className="reservations-layout"><ReservationGroup title="Próximas citas" appointments={upcoming} empty="No tienes próximas citas." /><ReservationGroup title="Citas anteriores" appointments={previous} empty="Aún no tienes citas anteriores." /></div>}</div></main>;
}

function ReservationGroup({ title, appointments, empty }: { title: string; appointments: CustomerAppointment[]; empty: string }) {
  return <section className="reservation-group"><div className="home-section-heading"><h2>{title}</h2><span>{appointments.length} {appointments.length === 1 ? "cita" : "citas"}</span></div>{appointments.length === 0 ? <div className="public-card reservation-empty">{empty}</div> : <div className="reservation-list">{appointments.map((appointment) => <article className="public-card reservation-card" key={appointment.appoid}><div><p className="booking-kicker">{appointment.status === "F" ? "Completada" : appointment.status === "A" ? "Confirmada" : "Pendiente"}</p><h3>{appointment.service_name || appointment.description || "Servicio reservado"}</h3><p>{appointment.employee_name ? `Con ${appointment.employee_name} ${appointment.employee_last_name ?? ""}` : "Barbero por asignar"}</p></div><div className="reservation-date"><strong>{new Date(`${appointment.date}T12:00:00`).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}</strong><span>{String(appointment.start_time).slice(0, 5)} · {appointment.service_price ? `$${Number(appointment.service_price).toFixed(2)}` : "Precio pendiente"}</span></div></article>)}</div>}</section>;
}
