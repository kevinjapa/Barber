import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Appointment, Client, Employee } from "./types";

type AppointmentForm = {
  date: string;
  start_time: string;
  end_time: string;
  description: string;
  status: string;
  empid: string;
  clientid: string;
};

type AppointmentsPanelProps = {
  apiUrl: string;
  currentEmployeeId?: number;
  appointments: Appointment[];
  clients: Client[];
  employees: Employee[];
  onChanged: () => void;
};

const emptyForm: AppointmentForm = {
  date: new Date().toISOString().slice(0, 10),
  start_time: "09:00",
  end_time: "10:00",
  description: "",
  status: "P",
  empid: "",
  clientid: "",
};

const inputClass =
  "mt-2 w-full border-b border-[#cbbdaf] bg-transparent px-0 py-3 outline-none focus:border-[#c8754e]";
const statusLabels: Record<string, string> = {
  P: "Pendiente",
  A: "Confirmada",
  F: "Finalizada",
};

async function readApiResponse(response: Response) {
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(result.detail ?? "No se pudo completar la operación");
  return result;
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

export function AppointmentsPanel({
  apiUrl,
  currentEmployeeId,
  appointments,
  clients,
  employees,
  onChanged,
}: AppointmentsPanelProps) {
  const [form, setForm] = useState<AppointmentForm>({
    ...emptyForm,
    empid: currentEmployeeId ? String(currentEmployeeId) : "",
  });
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const filteredAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          (!dateFilter || appointment.date.slice(0, 10) === dateFilter) &&
          (statusFilter === "all" || appointment.status === statusFilter),
      ),
    [appointments, dateFilter, statusFilter],
  );

  function updateField(field: keyof AppointmentForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function clearFeedback() {
    setError("");
    setMessage("");
  }

  function startEditing(appointment: Appointment) {
    clearFeedback();
    setEditingAppointment(appointment);
    setSelectedAppointment(appointment);
    setForm({
      date: appointment.date.slice(0, 10),
      start_time: formatTime(appointment.start_time),
      end_time: formatTime(appointment.end_time),
      description: appointment.description ?? "",
      status: appointment.status,
      empid: String(appointment.empid),
      clientid: String(appointment.clientid),
    });
  }

  async function handleStatusChange(nextStatus: "A" | "F") {
    if (!selectedAppointment || selectedAppointment.status === "F") return;
    clearFeedback();
    setIsUpdatingStatus(true);
    try {
      await readApiResponse(
        await fetch(
          `${apiUrl}/api/appointment/${selectedAppointment.appoid}/status`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: nextStatus }),
          },
        ),
      );
      setMessage(
        `Cita marcada como ${statusLabels[nextStatus].toLowerCase()}.`,
      );
      setSelectedAppointment(null);
      if (editingAppointment?.appoid === selectedAppointment.appoid)
        cancelEditing();
      onChanged();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "No se pudo actualizar el estado",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  function cancelEditing() {
    setEditingAppointment(null);
    setForm({
      ...emptyForm,
      empid: currentEmployeeId ? String(currentEmployeeId) : "",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        empid: Number(form.empid),
        clientid: Number(form.clientid),
      };
      const response = await fetch(
        editingAppointment
          ? `${apiUrl}/api/appointment/${editingAppointment.appoid}`
          : `${apiUrl}/api/appointment`,
        {
          method: editingAppointment ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      await readApiResponse(response);
      setMessage(
        editingAppointment
          ? "Cita actualizada correctamente."
          : "Cita creada correctamente.",
      );
      cancelEditing();
      onChanged();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo guardar la cita",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(appointment: Appointment) {
    if (appointment.status === "F") return;
    if (
      !window.confirm(
        `¿Cancelar la cita de ${appointment.client_name} ${appointment.client_last_name}?`,
      )
    )
      return;
    clearFeedback();
    setIsDeleting(appointment.appoid);
    try {
      await readApiResponse(
        await fetch(`${apiUrl}/api/appointment/${appointment.appoid}`, {
          method: "DELETE",
        }),
      );
      setMessage("Cita cancelada correctamente.");
      setSelectedAppointment(null);
      if (editingAppointment?.appoid === appointment.appoid) cancelEditing();
      onChanged();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo cancelar la cita",
      );
    } finally {
      setIsDeleting(null);
    }
  }

  return (
    <section className="py-8">
      <div className="flex flex-col justify-between gap-5 border-b border-[#d9cec1] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b5b3b]">
            Agenda
          </p>
          <h2 className="mt-2 font-serif text-4xl">Citas</h2>
          <p className="mt-3 max-w-2xl text-[#75675d]">
            Organiza las reservas, responsables y horarios de atención.
          </p>
        </div>
        <span className="text-sm text-[#75675d]">
          {filteredAppointments.length} citas visibles
        </span>
      </div>
      {error && (
        <p className="mt-5 border border-[#e5b8ae] bg-[#fff4f1] p-4 text-sm text-[#9b3d32]">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-5 border border-[#b8d0b9] bg-[#f2faf2] p-4 text-sm text-[#47704b]">
          {message}
        </p>
      )}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="border border-[#d9cec1] bg-[#fffaf4] p-6">
          <div className="flex flex-col justify-between gap-4 border-b border-[#e6dbcf] pb-5 sm:flex-row sm:items-center">
            <h3 className="font-serif text-2xl">Agenda</h3>
            <div className="flex gap-3">
              <input
                type="date"
                aria-label="Filtrar por fecha"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="border-b border-[#cbbdaf] bg-transparent px-0 py-2 text-sm outline-none focus:border-[#c8754e]"
              />
              <select
                aria-label="Filtrar por estado"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="border-b border-[#cbbdaf] bg-transparent py-2 text-sm outline-none focus:border-[#c8754e]"
              >
                <option value="all">Todos</option>
                <option value="P">Pendientes</option>
                <option value="A">Confirmadas</option>
                <option value="F">Finalizadas</option>
              </select>
            </div>
          </div>
          {selectedAppointment && (
            <div className="mt-4 border border-[#d9cec1] bg-[#fffaf4] p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9b5b3b]">Cita seleccionada</p>
                  <p className="mt-1 font-semibold">{selectedAppointment.client_name} {selectedAppointment.client_last_name}</p>
                  <p className="mt-1 text-sm text-[#75675d]">Estado actual: {statusLabels[selectedAppointment.status] ?? selectedAppointment.status}</p>
                </div>
                {selectedAppointment.status !== "F" ? (
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={isUpdatingStatus || selectedAppointment.status === "A"} onClick={() => void handleStatusChange("A")} className="border border-[#cbbdaf] px-3 py-2 text-sm font-semibold text-[#9b5b3b] disabled:cursor-not-allowed disabled:opacity-40">Confirmar</button>
                    <button type="button" disabled={isUpdatingStatus} onClick={() => void handleStatusChange("F")} className="bg-[#47704b] px-3 py-2 text-sm font-semibold text-[#fffaf4] disabled:cursor-not-allowed disabled:opacity-50">Finalizar</button>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-[#47704b]">Finalizada · no se puede cancelar</span>
                )}
              </div>
            </div>
          )}
          {filteredAppointments.length === 0 ? (
            <p className="py-8 text-[#75675d]">
              No hay citas para los filtros seleccionados.
            </p>
          ) : (
            <div className="divide-y divide-[#e6dbcf]">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.appoid}
                  className={`flex cursor-pointer flex-col gap-4 py-5 transition sm:flex-row sm:items-center sm:justify-between ${selectedAppointment?.appoid === appointment.appoid ? "bg-[#f4efe8] px-4" : ""}`}
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="font-semibold">
                        {appointment.client_name} {appointment.client_last_name}
                      </h4>
                      <span className="bg-[#f4efe8] px-2 py-1 text-xs font-semibold text-[#9b5b3b]">
                        {statusLabels[appointment.status] ?? appointment.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[#75675d]">
                      {appointment.date.slice(0, 10)} ·{" "}
                      {formatTime(appointment.start_time)} a{" "}
                      {formatTime(appointment.end_time)}
                    </p>
                    <p className="mt-1 text-xs text-[#75675d]">
                      Atiende: {appointment.employee_name}{" "}
                      {appointment.employee_last_name}
                      {appointment.description
                        ? ` · ${appointment.description}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm font-semibold">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        startEditing(appointment);
                      }}
                      className="text-[#9b5b3b] hover:text-[#2c2520]"
                    >
                      Editar
                    </button>
                    {appointment.status !== "F" && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleDelete(appointment);
                        }}
                        disabled={isDeleting === appointment.appoid}
                        className="text-[#9b3d32] hover:text-[#6e2b25] disabled:opacity-50"
                      >
                        {isDeleting === appointment.appoid
                          ? "Cancelando..."
                          : "Cancelar"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <form
          onSubmit={handleSubmit}
          className="h-fit border border-[#d9cec1] bg-[#fffaf4] p-6"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9b5b3b]">
            {editingAppointment ? "Editar cita" : "Nueva cita"}
          </p>
          <h3 className="mt-2 font-serif text-2xl">
            {editingAppointment ? "Actualizar reserva" : "Agendar cliente"}
          </h3>
          <div className="mt-6 space-y-5">
            <label className="block text-sm font-semibold">
              Cliente
              <select
                required
                value={form.clientid}
                onChange={(event) =>
                  updateField("clientid", event.target.value)
                }
                className={inputClass}
              >
                <option value="">Selecciona un cliente</option>
                {clients.map((client) => (
                  <option key={client.clientid} value={client.clientid}>
                    {client.name} {client.last_name} · {client.dni}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Barbero
              <select
                required
                value={form.empid}
                onChange={(event) => updateField("empid", event.target.value)}
                className={inputClass}
              >
                <option value="">Selecciona un barbero</option>
                {employees.map((employee) => (
                  <option key={employee.empid} value={employee.empid}>
                    {employee.name} {employee.last_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Fecha
              <input
                required
                type="date"
                value={form.date}
                onChange={(event) => updateField("date", event.target.value)}
                className={inputClass}
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-semibold">
                Inicio
                <input
                  required
                  type="time"
                  value={form.start_time}
                  onChange={(event) =>
                    updateField("start_time", event.target.value)
                  }
                  className={inputClass}
                />
              </label>
              <label className="block text-sm font-semibold">
                Fin
                <input
                  required
                  type="time"
                  value={form.end_time}
                  onChange={(event) =>
                    updateField("end_time", event.target.value)
                  }
                  className={inputClass}
                />
              </label>
            </div>
            <label className="block text-sm font-semibold">
              Estado
              <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
                className={inputClass}
              >
                <option value="P">Pendiente</option>
                <option value="A">Confirmada</option>
                <option value="F">Finalizada</option>
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Descripción
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                rows={3}
                className="mt-2 w-full resize-none border border-[#cbbdaf] bg-transparent p-3 outline-none focus:border-[#c8754e]"
              />
            </label>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#c8754e] px-5 py-3 text-sm font-semibold text-[#fffaf4] transition hover:bg-[#9b5b3b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? "Guardando..."
                : editingAppointment
                  ? "Actualizar cita"
                  : "Agendar cita"}
            </button>
            {editingAppointment && (
              <button
                type="button"
                onClick={cancelEditing}
                className="border border-[#cbbdaf] px-5 py-3 text-sm font-semibold text-[#75675d] hover:border-[#9b5b3b] hover:text-[#2c2520]"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
