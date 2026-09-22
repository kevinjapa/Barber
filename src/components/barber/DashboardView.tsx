import type { Appointment, Client, Employee, Invoice, Service } from "./types";

type DashboardViewProps = {
  services: Service[];
  clients: Client[];
  employees: Employee[];
  appointments: Appointment[];
  invoices: Invoice[];
  isLoading: boolean;
  hasError: boolean;
  onNavigate: (
    section: "appointments" | "clients" | "services" | "billing",
  ) => void;
};

const statusLabels: Record<string, string> = {
  P: "Pendiente",
  A: "Confirmada",
  F: "Finalizada",
};
const paymentLabels: Record<string, string> = {
  E: "Efectivo",
  T: "Tarjeta",
  R: "Transferencia",
};

function localDate() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

export function DashboardView({
  services,
  clients,
  employees,
  appointments,
  invoices,
  isLoading,
  hasError,
  onNavigate,
}: DashboardViewProps) {
  const today = localDate();
  const todaysAppointments = appointments.filter(
    (appointment) => appointment.date.slice(0, 10) === today,
  );
  const pendingAppointments = todaysAppointments.filter(
    (appointment) => appointment.status === "P",
  ).length;
  const confirmedAppointments = todaysAppointments.filter(
    (appointment) => appointment.status === "A",
  ).length;
  const paidInvoices = invoices.filter((invoice) => invoice.status === "P");
  const totalRevenue = paidInvoices.reduce(
    (total, invoice) => total + Number(invoice.total),
    0,
  );
  const upcomingAppointments = todaysAppointments
    .filter((appointment) => appointment.status !== "F")
    .slice(0, 5);
  const recentInvoices = invoices.slice(0, 5);

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="panel-surface border p-8">
          <p className="text-[#65716b]">Cargando el resumen del negocio...</p>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-8 py-8">
      {hasError && (
        <div className="border border-[#e5b8ae] bg-[#fff4f1] p-4 text-sm text-[#a84f3d]">
          No se pudo cargar el catálogo de servicios. El resto del resumen sigue
          disponible.
        </div>
      )}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="panel-surface border p-5">
          <div className="flex items-start justify-between">
            <p className="text-sm text-[#65716b]">Citas de hoy</p>
            <span className="text-xs font-semibold text-[#b96f45]">
              {pendingAppointments} pendientes
            </span>
          </div>
          <strong className="mt-5 block font-serif text-4xl text-[#153e38]">
            {todaysAppointments.length}
          </strong>
          <p className="mt-2 text-sm text-[#65716b]">
            {confirmedAppointments} confirmadas
          </p>
        </article>
        <article className="panel-surface border p-5">
          <p className="text-sm text-[#65716b]">Ingresos registrados</p>
          <strong className="mt-5 block font-serif text-4xl text-[#153e38]">
            ${totalRevenue.toFixed(2)}
          </strong>
          <p className="mt-2 text-sm text-[#65716b]">
            {paidInvoices.length} facturas pagadas
          </p>
        </article>
        <article className="panel-surface border p-5">
          <p className="text-sm text-[#65716b]">Clientes activos</p>
          <strong className="mt-5 block font-serif text-4xl text-[#153e38]">
            {clients.length}
          </strong>
          <button
            type="button"
            onClick={() => onNavigate("clients")}
            className="mt-2 text-sm font-semibold text-[#1d5b4f] hover:text-[#b96f45]"
          >
            Abrir directorio →
          </button>
        </article>
        <article className="panel-surface border p-5">
          <p className="text-sm text-[#65716b]">Equipo activo</p>
          <strong className="mt-5 block font-serif text-4xl text-[#153e38]">
            {employees.length}
          </strong>
          <p className="mt-2 text-sm text-[#65716b]">
            {services.length} servicios publicados
          </p>
        </article>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="panel-surface border p-6">
          <div className="flex items-end justify-between border-b border-[#e3e9e4] pb-5">
            <div>
              <p className="panel-kicker text-sm font-semibold uppercase">
                Agenda del día
              </p>
              <h2 className="panel-title mt-2 font-serif text-3xl">
                Próximas atenciones
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("appointments")}
              className="text-sm font-semibold text-[#1d5b4f] hover:text-[#b96f45]"
            >
              Ver agenda →
            </button>
          </div>
          {upcomingAppointments.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-serif text-2xl text-[#153e38]">
                Agenda despejada
              </p>
              <p className="mt-2 text-sm text-[#65716b]">
                No hay citas pendientes o confirmadas para hoy.
              </p>
              <button
                type="button"
                onClick={() => onNavigate("appointments")}
                className="mt-5 bg-[#153e38] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1d5b4f]"
              >
                Agendar una cita
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#e3e9e4]">
              {upcomingAppointments.map((appointment) => (
                <button
                  type="button"
                  key={appointment.appoid}
                  onClick={() => onNavigate("appointments")}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left hover:bg-[#f1f6f2]"
                >
                  <div>
                    <p className="font-semibold text-[#1f2925]">
                      {appointment.client_name} {appointment.client_last_name}
                    </p>
                    <p className="mt-1 text-sm text-[#65716b]">
                      {formatTime(appointment.start_time)} ·{" "}
                      {appointment.employee_name}{" "}
                      {appointment.employee_last_name}
                    </p>
                  </div>
                  <span className="bg-[#eef3ef] px-2 py-1 text-xs font-semibold text-[#1d5b4f]">
                    {statusLabels[appointment.status] ?? appointment.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </article>

        <article className="panel-surface border p-6">
          <div className="flex items-end justify-between border-b border-[#e3e9e4] pb-5">
            <div>
              <p className="panel-kicker text-sm font-semibold uppercase">
                Caja
              </p>
              <h2 className="panel-title mt-2 font-serif text-3xl">
                Últimas facturas
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("billing")}
              className="text-sm font-semibold text-[#1d5b4f] hover:text-[#b96f45]"
            >
              Ver todas →
            </button>
          </div>
          {recentInvoices.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#65716b]">
              Todavía no hay facturas emitidas.
            </p>
          ) : (
            <div className="divide-y divide-[#e3e9e4]">
              {recentInvoices.map((invoice) => (
                <button
                  type="button"
                  key={invoice.inv_heaid}
                  onClick={() => onNavigate("billing")}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left hover:bg-[#f1f6f2]"
                >
                  <div>
                    <p className="font-semibold text-[#1f2925]">
                      {invoice.code}
                    </p>
                    <p className="mt-1 text-sm text-[#65716b]">
                      {invoice.client_name
                        ? `${invoice.client_name} ${invoice.client_last_name ?? ""}`
                        : "Venta sin cliente"}
                    </p>
                  </div>
                  <div className="text-right">
                    <strong className="text-[#1d5b4f]">
                      ${Number(invoice.total).toFixed(2)}
                    </strong>
                    <p className="mt-1 text-xs text-[#65716b]">
                      {paymentLabels[invoice.payment_method] ??
                        invoice.payment_method}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onNavigate("appointments")}
          className="border border-[#dce3dd] bg-[#153e38] p-5 text-left text-white transition hover:-translate-y-0.5 hover:bg-[#1d5b4f]"
        >
          <p className="text-sm text-[#b7d0c8]">Acción rápida</p>
          <p className="mt-3 font-serif text-2xl">Nueva cita</p>
          <p className="mt-2 text-sm text-[#d8ebe3]">
            Organiza la próxima atención.
          </p>
        </button>
        <button
          type="button"
          onClick={() => onNavigate("clients")}
          className="panel-surface border p-5 text-left transition hover:-translate-y-0.5"
        >
          <p className="panel-kicker text-sm font-semibold uppercase">
            Acción rápida
          </p>
          <p className="panel-title mt-3 font-serif text-2xl">Nuevo cliente</p>
          <p className="mt-2 text-sm text-[#65716b]">
            Mantén tu directorio al día.
          </p>
        </button>
        <button
          type="button"
          onClick={() => onNavigate("services")}
          className="panel-surface border p-5 text-left transition hover:-translate-y-0.5"
        >
          <p className="panel-kicker text-sm font-semibold uppercase">
            Catálogo
          </p>
          <p className="panel-title mt-3 font-serif text-2xl">
            Gestionar servicios
          </p>
          <p className="mt-2 text-sm text-[#65716b]">
            Actualiza precios e imágenes.
          </p>
        </button>
      </section>
    </div>
  );
}
