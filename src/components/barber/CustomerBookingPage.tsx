"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { PublicHeader, readCustomerSession } from "./PublicHeader";
import type { Service } from "./types";

type Barber = { empid: number; name: string; last_name: string };
type PublicAppointment = { date: string; start_time: string; end_time: string; empid?: number | null };
type Customer = { clientid?: number; dni: string; name: string; last_name: string; email: string; phone: string };
type BookingMode = "choice" | "login" | "register" | "guest";

const weekdays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const emptyCustomer: Customer = { dni: "", name: "", last_name: "", email: "", phone: "" };

function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function serviceImage(service: Service) {
  return service.img_url ? `/uploads/services/${service.img_url.split("/").pop()}` : null;
}
function endTime(start: string, duration: number) {
  const [hours, minutes] = start.split(":").map(Number);
  const total = hours * 60 + minutes + duration;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function CustomerBookingPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<PublicAppointment[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
  const [date, setDate] = useState(() => localDate(new Date()));
  const [month, setMonth] = useState(() => new Date());
  const [time, setTime] = useState("");
  const [mode, setMode] = useState<BookingMode>("choice");
  const [customer, setCustomer] = useState<Customer>(emptyCustomer);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsMounted(true));
    const savedSession = readCustomerSession();
    if (savedSession) {
      window.requestAnimationFrame(() => setCustomer({ ...savedSession, phone: savedSession.phone ?? "" }));
    }
    Promise.all([fetch("/api/services"), fetch("/api/public/employees"), fetch("/api/public/appointments")])
      .then(async ([servicesResponse, barbersResponse, appointmentsResponse]) => {
        if (!servicesResponse.ok || !barbersResponse.ok || !appointmentsResponse.ok) throw new Error("No pudimos cargar la información.");
        setServices(await servicesResponse.json());
        setBarbers(await barbersResponse.json());
        setAppointments(await appointmentsResponse.json());
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "No pudimos cargar la información."))
      .finally(() => setLoading(false));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const serviceId = Number(params.get("service"));
    let frame: number | undefined;
    if (serviceId > 0) {
      const service = services.find((item) => item.serviceid === serviceId);
      if (service) frame = window.requestAnimationFrame(() => setSelectedService(service));
    }
    const barberId = Number(params.get("barber"));
    if (barberId > 0) frame = window.requestAnimationFrame(() => setSelectedBarber(barberId));
    return () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, [services]);

  const calendarDays = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    return Array.from({ length: 42 }, (_, index) => {
      const current = new Date(month.getFullYear(), month.getMonth(), index - offset + 1);
      return { value: localDate(current), day: current.getDate(), currentMonth: current.getMonth() === month.getMonth() };
    });
  }, [month]);

  const slots = useMemo(() => {
    if (!selectedService) return [];
    return Array.from({ length: 11 }, (_, index) => {
      const start = `${String(9 + index).padStart(2, "0")}:00`;
      return { start, end: endTime(start, selectedService.duration) };
    });
  }, [selectedService]);

  function isBooked(start: string, end: string) {
    const conflicts = appointments.filter((appointment) =>
      appointment.date.slice(0, 10) === date &&
      (!selectedBarber || appointment.empid === selectedBarber) &&
      appointment.start_time.slice(0, 5) < end &&
      appointment.end_time.slice(0, 5) > start,
    );
    return selectedBarber ? conflicts.length > 0 : conflicts.length >= barbers.length;
  }

  function selectService(service: Service) {
    setSelectedService(service);
    setSelectedBarber(null);
    setTime("");
    setMode("choice");
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateCustomer(field: keyof Customer, value: string) {
    setCustomer((current) => ({ ...current, [field]: value }));
  }

  async function submitAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const endpoint = mode === "login" ? "/api/public/account/login" : "/api/public/account";
      const body = mode === "login"
        ? { email: customer.email, password }
        : { ...customer, password, privacy_consent: privacy };
      if (mode === "register" && !privacy) throw new Error("Debes aceptar el aviso de privacidad.");
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail ?? "No se pudo completar la operación.");
      setCustomer((current) => ({ ...current, ...result }));
      setMode("choice");
      setPassword("");
      setMessage("Cuenta lista. Ahora elige tu fecha, horario y barbero.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo completar la operación.");
    } finally {
      setSaving(false);
    }
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedService || !time) return;
    if (!customer.dni || !customer.name || !customer.last_name || !customer.email || !customer.phone) {
      setError("Completa tus datos o inicia sesión antes de reservar.");
      return;
    }
    if (!privacy) {
      setError("Debes aceptar el aviso de privacidad.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/public/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customer,
          serviceid: selectedService.serviceid,
          empid: selectedBarber,
          date,
          start_time: time,
          end_time: endTime(time, selectedService.duration),
          description: selectedService.name,
          privacy_consent: privacy,
          reward_eligible: Boolean(customer.clientid),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail ?? "No se pudo reservar la cita.");
      setMessage("¡Cita registrada! Te confirmaremos muy pronto.");
      setAppointments((current) => [...current, { date, start_time: time, end_time: endTime(time, selectedService.duration), empid: selectedBarber }]);
      setTime("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo reservar la cita.");
    } finally {
      setSaving(false);
    }
  }

  if (!isMounted) return null;
  return (
    <main className="booking-shell min-h-screen">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
        <PublicHeader />

        {!selectedService ? (
          <>
            {/* <section className="booking-hero grid items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
              <div>
                <p className="booking-kicker">Barbería · estilo · comunidad</p>
                <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.98] text-[#153e38] sm:text-7xl">Tu mejor versión empieza en la silla.</h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-[#65716b]">Elige tu servicio, encuentra el horario ideal y déjanos cuidar cada detalle de tu experiencia.</p>
                <a href="#servicios" className="booking-submit mt-8 inline-block">Ver servicios</a>
              </div>
              <div className="booking-card overflow-hidden p-2">
                <img src="/assets/alvaberber_icon.png" alt="" className="mx-auto h-72 w-full object-contain p-8" />
              </div>
            </section> */}
            <section id="servicios" className="py-12 pb-24">
              <p className="booking-kicker">Nuestros servicios</p>
              <h2 className="mt-2 font-serif text-4xl text-[#153e38]">Elige cómo quieres verte.</h2>
              {loading ? <p className="mt-8 text-[#718078]">Cargando servicios...</p> : <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{services.map((service) => <button key={service.serviceid} type="button" onClick={() => selectService(service)} className="booking-card text-left transition hover:-translate-y-1 hover:border-[#1d5b4f]"><div className="h-40 overflow-hidden rounded-t-[1.25rem] bg-[#e8f0eb]">{serviceImage(service) ? <img src={serviceImage(service) ?? ""} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center font-serif text-5xl text-[#1d5b4f]">{service.name[0]}</div>}</div><div className="p-6"><div className="flex items-start justify-between gap-4"><h3 className="font-serif text-2xl text-[#153e38]">{service.name}</h3><strong className="text-[#b97848]">${service.price.toFixed(2)}</strong></div><p className="mt-3 text-sm leading-6 text-[#718078]">{service.description || "Un servicio personalizado para renovar tu estilo."}</p><span className="mt-5 inline-block text-sm font-bold text-[#1d5b4f]">Reservar este servicio →</span></div></button>)}</div>}
            </section>
            <section id="equipo" className="py-12">
              <p className="booking-kicker">Nuestro team</p>
              <h2 className="mt-2 font-serif text-4xl text-[#153e38]">Manos expertas, trato cercano.</h2>
              <p className="mt-4 max-w-2xl text-[#65716b]">Un equipo apasionado por los detalles, preparado para crear un estilo que se sienta tuyo.</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {barbers.map((barber) => <article key={barber.empid} className="booking-card p-5"><div className="booking-mark text-lg">{barber.name[0]}{barber.last_name[0]}</div><h3 className="mt-4 font-serif text-2xl text-[#153e38]">{barber.name} {barber.last_name}</h3><p className="mt-1 text-sm text-[#718078]">Barbero especialista</p></article>)}
              </div>
            </section>
          </>
        ) : (
          <section className="py-12 pb-20">
            <button type="button" onClick={() => setSelectedService(null)} className="mb-6 text-sm font-semibold text-[#1d5b4f] underline">← Volver a servicios</button>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="booking-kicker">Reservar servicio</p><h1 className="mt-2 font-serif text-5xl text-[#153e38]">{selectedService.name}</h1><p className="mt-2 text-[#718078]">{selectedService.duration} min · ${selectedService.price.toFixed(2)}</p></div><aside className="booking-card min-w-64 p-5 text-sm"><p className="booking-kicker">Resumen</p><div className="mt-3 flex justify-between gap-5"><span>{selectedService.name}</span><strong>${selectedService.price.toFixed(2)}</strong></div><p className="mt-2 text-[#718078]">{selectedService.duration} minutos</p><div className="mt-4 border-t border-[#e1e8e2] pt-3 font-bold text-[#153e38]"><span>Total a pagar</span><strong className="float-right">${selectedService.price.toFixed(2)}</strong></div></aside></div>
            {(error || message) && <div className={`mb-6 border p-4 text-sm ${error ? "border-[#e3b8ae] bg-[#fff5f1] text-[#98483d]" : "border-[#b8d0c4] bg-[#f0f8f2] text-[#37634f]"}`}>{error || message}</div>}
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <section className="booking-card p-5 sm:p-8"><div className="flex items-center justify-between"><div><p className="booking-kicker">Calendario</p><h2 className="mt-2 font-serif text-3xl capitalize text-[#153e38]">{month.toLocaleDateString("es", { month: "long", year: "numeric" })}</h2></div><div className="flex gap-2"><button type="button" className="booking-icon-button" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}>←</button><button type="button" className="booking-icon-button" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}>→</button></div></div><div className="mt-7 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#8a968f]">{weekdays.map((day) => <span key={day} className="py-2">{day}</span>)}{calendarDays.map((item) => <button key={item.value} type="button" disabled={!item.currentMonth || item.value < localDate(new Date())} onClick={() => { setDate(item.value); setTime(""); }} className={`calendar-day ${date === item.value ? "calendar-day-selected" : ""} ${!item.currentMonth || item.value < localDate(new Date()) ? "calendar-day-muted" : ""}`}>{item.day}</button>)}</div><div className="mt-8 border-t border-[#e1e8e2] pt-6"><p className="text-sm font-semibold text-[#153e38]">Horarios disponibles</p><div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">{slots.map((slot) => <button key={slot.start} type="button" disabled={isBooked(slot.start, slot.end)} onClick={() => setTime(slot.start)} className={`booking-time ${time === slot.start ? "booking-time-selected" : ""} ${isBooked(slot.start, slot.end) ? "booking-time-booked" : ""}`}>{slot.start}{isBooked(slot.start, slot.end) && <small>Ocupado</small>}</button>)}</div></div></section>
              <form onSubmit={mode === "choice" || mode === "guest" ? submitBooking : submitAccount} className="booking-card p-5 sm:p-8">
                <p className="booking-kicker">Tu reserva</p><h2 className="mt-2 font-serif text-3xl text-[#153e38]">{mode === "choice" || mode === "guest" ? "Elige tu barbero" : mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}</h2>
                <div className="mt-6 space-y-4">
                  {(mode === "choice" || mode === "guest") && <><label className="booking-label">Barbero<select value={selectedBarber ?? ""} onChange={(event) => { setSelectedBarber(event.target.value ? Number(event.target.value) : null); setTime(""); }} className="booking-field mt-2 w-full"><option value="">Cualquier barbero disponible</option>{barbers.map((barber) => <option key={barber.empid} value={barber.empid}>{barber.name} {barber.last_name}</option>)}</select></label>{mode === "choice" && <div className="border-y border-[#e1e8e2] py-5"><p className="text-sm font-semibold text-[#153e38]">¿Tienes una cuenta?</p><div className="mt-3 grid gap-2 sm:grid-cols-3"><button type="button" onClick={() => setMode("login")} className="action-primary px-3 py-3 text-sm">Iniciar sesión</button><button type="button" onClick={() => setMode("register")} className="action-secondary px-3 py-3 text-sm">Crear cuenta</button><button type="button" onClick={() => setMode("guest")} className="action-secondary px-3 py-3 text-sm">Continuar invitado</button></div></div>}</>}
                  {(mode === "login" || mode === "register" || mode === "guest") && <div className="grid gap-4 sm:grid-cols-2">{mode !== "login" && <><label className="booking-label">Cédula<input required value={customer.dni} onChange={(event) => updateCustomer("dni", event.target.value)} className="booking-field mt-2 w-full" /></label><label className="booking-label">Nombre<input required value={customer.name} onChange={(event) => updateCustomer("name", event.target.value)} className="booking-field mt-2 w-full" /></label><label className="booking-label">Apellido<input required value={customer.last_name} onChange={(event) => updateCustomer("last_name", event.target.value)} className="booking-field mt-2 w-full" /></label><label className="booking-label">Teléfono<input required value={customer.phone} onChange={(event) => updateCustomer("phone", event.target.value)} className="booking-field mt-2 w-full" /></label></>}{<label className="booking-label sm:col-span-2">Correo<input required type="email" value={customer.email} onChange={(event) => updateCustomer("email", event.target.value)} className="booking-field mt-2 w-full" /></label>} {mode !== "guest" && <label className="booking-label sm:col-span-2">Contraseña<input required type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="booking-field mt-2 w-full" /></label>}</div>}
                  {(mode === "register" || mode === "guest" || mode === "choice") && <label className="flex items-start gap-3 text-xs leading-5 text-[#65716b]"><input required type="checkbox" checked={privacy} onChange={(event) => setPrivacy(event.target.checked)} className="mt-1 accent-[#1d5b4f]" /><span>Acepto el <a href="/privacidad" target="_blank" rel="noreferrer" className="font-semibold text-[#1d5b4f] underline">aviso de privacidad</a>. {mode === "guest" && "Las reservas como invitado no generan puntos."}</span></label>}
                </div>
                {mode === "choice" && !customer.clientid ? <p className="mt-6 text-sm leading-6 text-[#718078]">Selecciona una opción de cuenta para completar tus datos y confirmar.</p> : <button type="submit" disabled={saving || !time || (mode === "choice" && !customer.clientid)} className="booking-submit mt-7 w-full">{saving ? "Procesando..." : mode === "guest" || mode === "choice" ? "Confirmar reserva" : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</button>}
                {mode !== "choice" && <button type="button" onClick={() => setMode("choice")} className="mt-4 w-full text-sm font-semibold text-[#1d5b4f] underline">← Cambiar opción</button>}
              </form>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
