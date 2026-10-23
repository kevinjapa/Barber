"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ThemeToggle } from "./ThemeToggle";

type PublicAppointment = {
  date: string;
  start_time: string;
  end_time: string;
};

type BookingForm = {
  dni: string;
  name: string;
  last_name: string;
  email: string;
  phone: string;
  birth_date: string;
  description: string;
};

const emptyForm: BookingForm = {
  dni: "",
  name: "",
  last_name: "",
  email: "",
  phone: "",
  birth_date: "",
  description: "",
};

const weekdayLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const monthFormatter = new Intl.DateTimeFormat("es", {
  month: "long",
  year: "numeric",
});
const dateFormatter = new Intl.DateTimeFormat("es", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatHour(value: string) {
  return value.slice(0, 5);
}

function createCalendarDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) => {
    const day = index - startOffset + 1;
    return new Date(month.getFullYear(), month.getMonth(), day);
  }).map((date) => ({
    isCurrentMonth: date.getMonth() === month.getMonth(),
    dayNumber: date.getDate(),
    value: localDateString(date),
  }));
}

export function CustomerBookingPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [today] = useState(() => localDateString(new Date()));
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() =>
    localDateString(new Date()),
  );
  const [selectedTime, setSelectedTime] = useState("");
  const [appointments, setAppointments] = useState<PublicAppointment[]>([]);
  const [employeeCapacity, setEmployeeCapacity] = useState(0);
  const [form, setForm] = useState<BookingForm>(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLookingUpClient, setIsLookingUpClient] = useState(false);
  const [clientFound, setClientFound] = useState<boolean | null>(null);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (clientFound !== true) return;

    let isActive = true;
    async function loadAvailability() {
      setIsLoading(true);
      try {
        const [appointmentsResponse, employeesResponse] = await Promise.all([
          fetch("/api/public/appointments"),
          fetch("/api/public/employees"),
        ]);
        if (!appointmentsResponse.ok || !employeesResponse.ok)
          throw new Error("No pudimos cargar la disponibilidad.");
        const [activeAppointments, availableEmployees] = await Promise.all([
          appointmentsResponse.json(),
          employeesResponse.json(),
        ]);
        if (isActive) {
          setAppointments(activeAppointments);
          setEmployeeCapacity(availableEmployees.length);
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No pudimos cargar la disponibilidad.",
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }
    void loadAvailability();
    return () => {
      isActive = false;
    };
  }, [clientFound]);

  const calendarDays = useMemo(
    () => createCalendarDays(month),
    [month],
  );
  const selectedDateAppointments = appointments.filter(
    (appointment) => appointment.date.slice(0, 10) === selectedDate,
  );
  const timeSlots = Array.from({ length: 11 }, (_, index) => {
    const hour = 9 + index;
    return `${String(hour).padStart(2, "0")}:00`;
  });
  function slotEnd(time: string) {
    return `${String(Number(time.slice(0, 2)) + 1).padStart(2, "0")}:${time.slice(3)}`;
  }

  function isBooked(time: string) {
    const end = slotEnd(time);
    const reservations = selectedDateAppointments.filter((appointment) =>
        formatHour(appointment.start_time) < end &&
        formatHour(appointment.end_time) > time,
    );
    return employeeCapacity === 0 || reservations.length >= employeeCapacity;
  }

  function chooseDate(value: string) {
    if (value < today) return;
    setSelectedDate(value);
    setSelectedTime("");
    const nextMonth = new Date(`${value}T12:00:00`);
    if (nextMonth.getMonth() !== month.getMonth())
      setMonth(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1));
  }

  function updateField(field: keyof BookingForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function changeCustomer() {
    setClientFound(null);
    setForm((current) => ({ ...emptyForm, dni: current.dni }));
    setSelectedTime("");
    setError("");
    setMessage("");
    setPrivacyConsent(false);
    setMarketingConsent(false);
  }

  async function lookupClient() {
    const dni = form.dni.trim();
    if (!dni) return;
    setError("");
    setMessage("");
    setIsLookingUpClient(true);
    try {
      const response = await fetch(`/api/public/client/${encodeURIComponent(dni)}`);
      if (response.status === 404) {
        setClientFound(false);
        setMessage("No encontramos ese cliente. Regístralo para continuar.");
        return;
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.detail ?? "No se pudo consultar la cédula.");
      setForm((current) => ({
        ...current,
        dni: result.dni,
        name: result.name,
        last_name: result.last_name,
        email: result.email ?? "",
        phone: result.phone ?? "",
      }));
      setClientFound(true);
      setMessage(`¡Hola, ${result.name}! Encontramos tus datos.`);
    } catch (lookupError) {
      setError(
        lookupError instanceof Error
          ? lookupError.message
          : "No se pudo consultar la cédula.",
      );
    } finally {
      setIsLookingUpClient(false);
    }

  }

  async function registerClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!privacyConsent) {
      setError("Debes aceptar el aviso de privacidad para registrarte.");
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch("/api/public/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          privacy_consent: privacyConsent,
          marketing_consent: marketingConsent,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(result.detail ?? "No se pudo registrar el cliente.");
      setClientFound(true);
      setMessage("Registro completado. Ahora puedes elegir tu fecha y horario.");
      setPrivacyConsent(false);
    } catch (registerError) {
      setError(
        registerError instanceof Error
          ? registerError.message
          : "No se pudo registrar el cliente.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!privacyConsent) {
      setError("Debes aceptar el aviso de privacidad para reservar.");
      return;
    }
    if (!selectedTime) {
      setError("Selecciona un horario disponible.");
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch("/api/public/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          date: selectedDate,
          start_time: selectedTime,
          end_time: slotEnd(selectedTime),
          privacy_consent: privacyConsent,
          marketing_consent: marketingConsent,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = result.detail ?? "No se pudo reservar la cita.";
        if (response.status === 409) window.alert(detail);
        throw new Error(detail);
      }
      const confirmationMessage =
        "¡Cita registrada correctamente! Te confirmaremos muy pronto.";
      setMessage(confirmationMessage);
      window.alert(confirmationMessage);
      setClientFound(null);
      setForm(emptyForm);
      setSelectedTime("");
      setPrivacyConsent(false);
      setMarketingConsent(false);
      setAppointments((current) => [
        ...current,
        {
          date: selectedDate,
          start_time: selectedTime,
          end_time: slotEnd(selectedTime),
        },
      ]);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo reservar la cita.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!isMounted) {
    return (
      <main className="booking-shell min-h-screen">
        <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex items-center gap-3">
            {/* <span className="booking-mark">A</span> */}
            <img
              src="/assets/alvaberber_icon.png"
              alt="AlvaBarber"
              className="booking-mark"
            />
            <span className="font-serif text-xl tracking-tight">AlvaBarber Academy</span>
          </header>
        </div>
      </main>
    );
  }

  return (
    <main className="booking-shell min-h-screen">
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between">
          <a href="/reservar" className="flex items-center gap-3">
            {/* <span className="booking-mark">A</span> */}
            <img
              src="/assets/alvaberber_icon.png"
              alt="AlvaBarber"
              className="booking-mark"
            />
            <span className="font-serif text-xl tracking-tight">AlvaBarber Academy</span>
          </a>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-[#718078] sm:block">
              Reserva online
            </span>
            <ThemeToggle />
          </div>
        </header>

        <section className="booking-hero py-12 sm:py-16">
          <p className="booking-kicker">Tu próxima experiencia</p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.98] text-[#153e38] sm:text-7xl">
            Un buen corte empieza con un buen momento.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#65716b]">
            Elige el día y el horario que mejor te convenga.
            Un barbero confirmará tu solicitud.
          </p>
        </section>

        {clientFound === null || clientFound === false ? (
          <section className="booking-card mx-auto mb-16 max-w-xl p-6 sm:p-8">
            <p className="booking-kicker">Antes de reservar</p>
            <h2 className="mt-2 font-serif text-3xl text-[#153e38]">
              {clientFound === false ? "Completa tu registro" : "Identifica tu cuenta"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#718078]">
              {clientFound === false
                ? "Necesitamos tus datos para crear el cliente antes de mostrar la agenda."
                : "Ingresa tu cédula para recuperar tus datos o registrarte como cliente nuevo."}
            </p>
            {(error || message) && (
              <div
                className={`mt-5 border p-4 text-sm ${error ? "border-[#e3b8ae] bg-[#fff5f1] text-[#98483d]" : "border-[#b8d0c4] bg-[#f0f8f2] text-[#37634f]"}`}
              >
                {error || message}
              </div>
            )}
            {clientFound === null && <label className="booking-label mt-6">
              Cédula / DNI
              <div className="mt-2 flex gap-2">
                <input
                  required
                  autoFocus
                  value={form.dni}
                  onChange={(event) => {
                    updateField("dni", event.target.value);
                    setError("");
                    setMessage("");
                  }}
                  className="booking-field min-w-0 flex-1"
                  placeholder="Ej. 0102030405"
                />
                <button
                  type="button"
                  onClick={() => void lookupClient()}
                  disabled={isLookingUpClient || !form.dni.trim()}
                  className="booking-submit shrink-0 px-4"
                >
                  {isLookingUpClient ? "Buscando..." : "Continuar"}
                </button>
              </div>
            </label>}
            {clientFound === false && (
              <form onSubmit={registerClient} className="mt-6 space-y-4">
                <label className="booking-label">
                  Cédula / DNI
                  <input value={form.dni} readOnly className="booking-field mt-2 w-full bg-[#f3f6f3]" />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="booking-label">
                    Nombre
                    <input required value={form.name} onChange={(event) => updateField("name", event.target.value)} className="booking-field mt-2 w-full" />
                  </label>
                  <label className="booking-label">
                    Apellido
                    <input required value={form.last_name} onChange={(event) => updateField("last_name", event.target.value)} className="booking-field mt-2 w-full" />
                  </label>
                </div>
                <label className="booking-label">
                  Correo electrónico
                  <input required type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} className="booking-field mt-2 w-full" />
                </label>
                <label className="booking-label">
                  Teléfono
                  <input required type="tel" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className="booking-field mt-2 w-full" />
                </label>
                <label className="booking-label">
                  Fecha de cumpleaños
                  <input type="date" value={form.birth_date} onChange={(event) => updateField("birth_date", event.target.value)} className="booking-field mt-2 w-full" />
                </label>
                <label className="flex items-start gap-3 text-xs leading-5 text-[#65716b]">
                  <input
                    required
                    type="checkbox"
                    checked={privacyConsent}
                    onChange={(event) => setPrivacyConsent(event.target.checked)}
                    className="mt-1 accent-[#1d5b4f]"
                  />
                  <span>
                    Acepto el{" "}
                    <a href="/privacidad" target="_blank" rel="noreferrer" className="font-semibold text-[#1d5b4f] underline">
                      aviso de privacidad
                    </a>{" "}
                    y autorizo el uso de mis datos para gestionar mi cuenta y
                    mis citas.
                  </span>
                </label>
                <label className="flex items-start gap-3 text-xs leading-5 text-[#65716b]">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(event) => setMarketingConsent(event.target.checked)}
                    className="mt-1 accent-[#1d5b4f]"
                  />
                  <span>
                    Acepto recibir promociones y comunicaciones de AlvaBarber.
                    Es opcional y puedo retirarlo después.
                  </span>
                </label>
                <button type="submit" disabled={isSaving} className="booking-submit w-full">
                  {isSaving ? "Registrando..." : "Registrarme y continuar"}
                </button>
              </form>
            )}
          </section>
        ) : (
          <>
        <button
          type="button"
          onClick={changeCustomer}
          className="mb-5 text-sm font-semibold text-[#1d5b4f] underline-offset-4 hover:underline"
        >
          ← Cambiar cédula
        </button>
        {(error || message) && (
          <div
            className={`mb-6 border p-4 text-sm ${error ? "border-[#e3b8ae] bg-[#fff5f1] text-[#98483d]" : "border-[#b8d0c4] bg-[#f0f8f2] text-[#37634f]"}`}
          >
            {error || message}
          </div>
        )}

        <div className="grid gap-6 pb-16 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="booking-card p-5 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="booking-kicker">Paso 1</p>
                <h2 className="mt-2 font-serif text-3xl capitalize text-[#153e38]">
                  {monthFormatter.format(month)}
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Mes anterior"
                  onClick={() =>
                    setMonth(
                      (current) =>
                        new Date(current.getFullYear(), current.getMonth() - 1, 1),
                    )
                  }
                  className="booking-icon-button"
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="Mes siguiente"
                  onClick={() =>
                    setMonth(
                      (current) =>
                        new Date(current.getFullYear(), current.getMonth() + 1, 1),
                    )
                  }
                  className="booking-icon-button"
                >
                  →
                </button>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#8a968f]">
              {weekdayLabels.map((label) => (
                <span key={label} className="py-2">
                  {label}
                </span>
              ))}
              {calendarDays.map(({ value, dayNumber, isCurrentMonth }) => {
                const isPast = value < today;
                const isSelected = value === selectedDate;
                return (
                  <button
                    type="button"
                    key={value}
                    disabled={isPast || !isCurrentMonth}
                    onClick={() => chooseDate(value)}
                    className={`calendar-day ${isSelected ? "calendar-day-selected" : ""} ${!isCurrentMonth || isPast ? "calendar-day-muted" : ""}`}
                  >
                    {dayNumber}
                  </button>
                );
              })}
            </div>
            <div className="mt-8 border-t border-[#e1e8e2] pt-6">
              <p className="text-sm text-[#65716b]">
                Seleccionado:{" "}
                <strong className="capitalize text-[#153e38]">
                  {dateFormatter.format(new Date(`${selectedDate}T12:00:00`))}
                </strong>
              </p>
              <p className="mt-5 block text-sm font-semibold text-[#153e38]">
                Elige un horario
              </p>
              <p className="mt-6 text-sm font-semibold text-[#153e38]">
                Horarios disponibles
              </p>
              {isLoading ? (
                <p className="mt-3 text-sm text-[#718078]">Cargando horarios...</p>
              ) : (
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {timeSlots.map((time) => {
                    const timeIsBooked = isBooked(time);
                    return (
                      <button
                        type="button"
                        key={time}
                        disabled={timeIsBooked}
                        onClick={() => setSelectedTime(time)}
                        className={`booking-time ${selectedTime === time ? "booking-time-selected" : ""} ${timeIsBooked ? "booking-time-booked" : ""}`}
                      >
                        {time}
                        {timeIsBooked && <small>Ocupado</small>}
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="mt-4 text-xs text-[#718078]">
                Las citas duran 1 hora. Los horarios ocupados aparecen bloqueados.
                Tu solicitud quedará pendiente hasta que un barbero la confirme.
              </p>
            </div>
          </section>

          <form onSubmit={handleSubmit} className="booking-card p-5 sm:p-8">
            <p className="booking-kicker">Paso 2</p>
            <h2 className="mt-2 font-serif text-3xl text-[#153e38]">
              {clientFound ? "Confirma tu reserva" : "Completa tus datos"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#718078]">
              {clientFound
                ? `Reservando para ${form.name} ${form.last_name}.`
                : "Como es tu primera visita, necesitamos estos datos para registrarte."}
            </p>
            <div className="mt-7 space-y-4">
              {!clientFound && <div className="grid gap-4 sm:grid-cols-2">
                <label className="booking-label">
                  Nombre
                  <input required value={form.name} onChange={(event) => updateField("name", event.target.value)} className="booking-field mt-2 w-full" />
                </label>
                <label className="booking-label">
                  Apellido
                  <input required value={form.last_name} onChange={(event) => updateField("last_name", event.target.value)} className="booking-field mt-2 w-full" />
                </label>
              </div>}
              {!clientFound && <label className="booking-label">
                Correo electrónico
                <input required type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} className="booking-field mt-2 w-full" />
              </label>}
              {!clientFound && <label className="booking-label">
                Teléfono
                <input required type="tel" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className="booking-field mt-2 w-full" />
              </label>}
              {!clientFound && <label className="booking-label">
                Fecha de cumpleaños
                <input type="date" value={form.birth_date} onChange={(event) => updateField("birth_date", event.target.value)} className="booking-field mt-2 w-full" />
              </label>}
              <label className="booking-label">
                ¿Qué te gustaría hacerte?
                <textarea rows={4} value={form.description} onChange={(event) => updateField("description", event.target.value)} className="booking-field mt-2 w-full resize-none" placeholder="Ej. Corte clásico y arreglo de barba" />
              </label>
            </div>
            <button
              type="submit"
              disabled={isSaving || !selectedTime}
              className="booking-submit mt-7 w-full"
            >
              {isSaving ? "Enviando solicitud..." : "Confirmar reserva"}
            </button>
            <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-[#65716b]">
              <input
                required
                type="checkbox"
                checked={privacyConsent}
                onChange={(event) => setPrivacyConsent(event.target.checked)}
                className="mt-1 accent-[#1d5b4f]"
              />
              <span>
                Acepto el{" "}
                <a href="/privacidad" target="_blank" rel="noreferrer" className="font-semibold text-[#1d5b4f] underline">
                  aviso de privacidad
                </a>{" "}
                para gestionar esta reserva y mis datos de cliente.
              </span>
            </label>
            <label className="mt-3 flex items-start gap-3 text-xs leading-5 text-[#65716b]">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(event) => setMarketingConsent(event.target.checked)}
                className="mt-1 accent-[#1d5b4f]"
              />
              <span>
                Quiero recibir promociones y comunicaciones de AlvaBarber
                (opcional).
              </span>
            </label>
            <p className="mt-4 text-center text-xs leading-5 text-[#8a968f]">
              Tu reserva quedará pendiente de confirmación. Si el horario se
              ocupa antes de enviar, te avisaremos para elegir otro.
            </p>
          </form>
        </div>
          </>
        )}
      </div>
    </main>
  );
}
