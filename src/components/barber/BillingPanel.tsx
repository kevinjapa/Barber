import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type {
  Appointment,
  Client,
  Invoice,
  InvoiceWithDetails,
  PendingPaymentInvoice,
  Product,
  Service,
} from "./types";

type InvoiceItem = {
  kind: "service" | "product";
  id: string;
  quantity: number;
};

type NewClientForm = {
  dni: string;
  name: string;
  last_name: string;
  email: string;
  address: string;
  phone: string;
  ruc: string;
};

type BillingPanelProps = {
  apiUrl: string;
  clients: Client[];
  appointments: Appointment[];
  services: Service[];
  products: Product[];
  invoices: Invoice[];
  onChanged: () => void;
};

const paymentLabels: Record<string, string> = {
  E: "Efectivo",
  T: "Tarjeta",
  R: "Transferencia",
};
const statusLabels: Record<string, string> = { D: "Pendiente", P: "Pagada", C: "Cancelada" };
const emptyNewClient: NewClientForm = {
  dni: "",
  name: "",
  last_name: "",
  email: "",
  address: "",
  phone: "",
  ruc: "",
};

async function readApiResponse(response: Response) {
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(result.detail ?? "No se pudo completar la operación");
  return result;
}

function createCode() {
  return `FAC-${Date.now().toString().slice(-8)}`;
}

export function BillingPanel({
  apiUrl,
  clients,
  appointments,
  services,
  products,
  invoices,
  onChanged,
}: BillingPanelProps) {
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [code, setCode] = useState(createCode);
  const [clientid, setClientid] = useState("");
  const [clientDni, setClientDni] = useState("");
  const [newClient, setNewClient] = useState<NewClientForm>(emptyNewClient);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [appoid, setAppoid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [items, setItems] = useState<InvoiceItem[]>([
    { kind: "service", id: "", quantity: 1 },
  ]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PendingPaymentInvoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceDetails, setInvoiceDetails] =
    useState<InvoiceWithDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [query, setQuery] = useState("");

  const visibleInvoices = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return invoices;
    return invoices.filter((invoice) =>
      `${invoice.code} ${invoice.client_name ?? ""} ${invoice.client_last_name ?? ""}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [invoices, query]);

  const selectedClient = clients.find(
    (client) => String(client.clientid) === clientid,
  );
  const hasMatchingClient = clients.some(
    (client) => client.dni.trim().toLowerCase() === clientDni.trim().toLowerCase(),
  );
  const availableAppointments = useMemo(
    () =>
      clientid
        ? appointments.filter((appointment) => String(appointment.clientid) === clientid)
        : appointments,
    [appointments, clientid],
  );
  const completedClientAppointments = availableAppointments.filter(
    (appointment) =>
      String(appointment.clientid) === clientid && appointment.status === "F",
  );
  let effectiveAppoid = "";
  if (availableAppointments.some((appointment) => String(appointment.appoid) === appoid)) {
    effectiveAppoid = appoid;
  } else if (completedClientAppointments.length === 1) {
    effectiveAppoid = String(completedClientAppointments[0].appoid);
  }
  let appointmentPlaceholder = "No hay citas disponibles";
  if (availableAppointments.length) appointmentPlaceholder = "Selecciona una cita";

  function updateItem(
    index: number,
    field: keyof InvoiceItem,
    value: string | number,
  ) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      { kind: "service", id: "", quantity: 1 },
    ]);
  }

  function handleClientDniChange(value: string) {
    setClientDni(value);
    const client = clients.find(
      (current) => current.dni.trim().toLowerCase() === value.trim().toLowerCase(),
    );
    setClientid(client ? String(client.clientid) : "");
    setNewClient((current) => ({ ...current, dni: value }));
  }

  function updateNewClient(field: keyof NewClientForm, value: string) {
    setNewClient((current) => ({ ...current, [field]: value }));
  }

  async function handleCreateClient() {
    setError("");
    setMessage("");
    setIsCreatingClient(true);
    try {
      const result = await readApiResponse(
        await fetch(`${apiUrl}/api/client`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newClient),
        }),
      );
      setClientid(String(result.clientid));
      setClientDni(newClient.dni);
      setMessage("Cliente creado y seleccionado para la factura.");
      setNewClient(emptyNewClient);
      onChanged();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "No se pudo crear el cliente",
      );
    } finally {
      setIsCreatingClient(false);
    }
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.length === 1
        ? current
        : current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function getItemPrice(item: InvoiceItem) {
    if (item.kind === "service") {
      return (
        services.find((service) => service.serviceid === Number(item.id))
          ?.price ?? 0
      );
    }
    return (
      products.find((product) => product.productid === Number(item.id))
        ?.price ?? 0
    );
  }

  const estimatedTotal = items.reduce(
    (total, item) => total + getItemPrice(item) * item.quantity,
    0,
  );

  async function handleSelectInvoice(invoice: Invoice) {
    if (selectedInvoice?.inv_heaid === invoice.inv_heaid) {
      setSelectedInvoice(null);
      setInvoiceDetails(null);
      return;
    }

    setSelectedInvoice(invoice);
    setInvoiceDetails(null);
    setError("");
    setIsLoadingDetails(true);
    try {
      const response = await fetch(
        `${apiUrl}/api/invoices/${invoice.inv_heaid}`,
      );
      const result = (await readApiResponse(response)) as InvoiceWithDetails;
      setInvoiceDetails(result);
    } catch (detailError) {
      setError(
        detailError instanceof Error
          ? detailError.message
          : "No se pudo cargar el detalle de la factura",
      );
    } finally {
      setIsLoadingDetails(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);
    try {
      const details = items.map((item) => ({
        [item.kind === "service" ? "serviceid" : "productid"]: Number(item.id),
        quantity: item.quantity,
      }));
      if (details.some((detail) => !Object.values(detail)[0]))
        throw new Error("Selecciona un producto o servicio en cada línea");
      const createdInvoice = await readApiResponse(
        await fetch(`${apiUrl}/api/invoices`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            payment_method: paymentMethod,
            status: "pendiente",
            clientid: clientid ? Number(clientid) : null,
            appoid: effectiveAppoid ? Number(effectiveAppoid) : null,
            details,
          }),
        }),
      );
      setMessage("Factura generada. Confirma el pago para cerrarla.");
      setPendingPayment({
        inv_heaid: createdInvoice.inv_heaid,
        code: createdInvoice.code ?? code,
        total: Number(createdInvoice.total),
        paymentMethod,
      });
      setCode(createCode());
      setClientid("");
      setClientDni("");
      setAppoid("");
      setItems([{ kind: "service", id: "", quantity: 1 }]);
      onChanged();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo crear la factura",
      );
    } finally {
      setIsSaving(false);
    }
  }
  // funcion para enviar correo electronico con la factura
  async function handleSendInvoiceEmail() {
    if (!selectedInvoice) return;
    setError("");
    setMessage("");
    setIsSendingEmail(true);
    try {
      await readApiResponse(
        await fetch(
          `${apiUrl}/api/invoices/${selectedInvoice.inv_heaid}/send-email`,
          {
            method: "POST",
          },
        ),
      );
      setMessage(
        `El comprobante de la factura ${selectedInvoice.code} se está enviando al correo del cliente.`,
      );
    } catch (emailError) {
      setError(
        emailError instanceof Error
          ? emailError.message
          : "No se pudo enviar el comprobante",
      );
    } finally {
      setIsSendingEmail(false);
    }
    }


  async function handleMarkAsPaid() {
    if (!pendingPayment) return;
    setError("");
    setIsMarkingPaid(true);
    try {
      await readApiResponse(
        await fetch(`${apiUrl}/api/invoices/${pendingPayment.inv_heaid}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "pagada" }),
        }),
      );
      setPendingPayment(null);
      setMessage(`Factura ${pendingPayment.code} marcada como pagada.`);
      setSelectedInvoice((current) => current ? { ...current, status: "P" } : current);
      setInvoiceDetails((current) => current ? { ...current, status: "P" } : current);
      onChanged();
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "No se pudo confirmar el pago");
    } finally {
      setIsMarkingPaid(false);
    }
  }

  return (
    <section className="py-8">
      {pendingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#153e38]/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="payment-confirmation-title">
          <div className="panel-surface w-full max-w-lg border p-6 shadow-2xl sm:p-8">
            <p className="panel-kicker text-sm font-semibold uppercase">Factura generada</p>
            <h2 id="payment-confirmation-title" className="panel-title mt-3 font-serif text-3xl">¿Deseas marcarla como pagada?</h2>
            <p className="mt-3 text-[#65716b]">La factura <strong className="text-[#1f2925]">{pendingPayment.code}</strong> está lista para confirmar.</p>
            <div className="mt-6 flex items-end justify-between border-y border-[#e3e9e4] py-5"><span className="text-sm text-[#65716b]">Total a cobrar · {paymentLabels[pendingPayment.paymentMethod] ?? pendingPayment.paymentMethod}</span><strong className="font-serif text-4xl text-[#153e38]">${pendingPayment.total.toFixed(2)}</strong></div>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => setPendingPayment(null)} disabled={isMarkingPaid} className="action-secondary px-5 py-3 text-sm font-semibold">Dejar pendiente</button><button type="button" onClick={() => void handleMarkAsPaid()} disabled={isMarkingPaid} className="action-primary px-5 py-3 text-sm font-semibold disabled:opacity-60">{isMarkingPaid ? "Confirmando..." : "Sí, marcar como pagada"}</button></div>
          </div>
        </div>
      )}
      <div className="border-b border-[#d9cec1] pb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b5b3b]">
          Caja
        </p>
        <h2 className="mt-2 font-serif text-4xl">Facturación</h2>
        <p className="mt-3 max-w-2xl text-[#75675d]">
          Genera comprobantes con los servicios y productos vendidos, y consulta
          el historial.
        </p>
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
      <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <form
          onSubmit={handleSubmit}
          className="panel-surface h-fit border p-6"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9b5b3b]">
            Nueva factura
          </p>
          <div className="mt-6 space-y-5">
            <label className="block text-sm font-semibold">
              Código
              <input
                required
                readOnly
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="field-control mt-2 w-full px-3 py-3"
              />
            </label>
            <label className="block text-sm font-semibold">
              Cédula del cliente
              <input
                value={clientDni}
                list="billing-client-dnis"
                onChange={(event) => handleClientDniChange(event.target.value)}
                placeholder="Ingresa la cédula"
                className="field-control mt-2 w-full px-3 py-3"
              />
              <datalist id="billing-client-dnis">
                {clients.map((client) => (
                  <option key={client.clientid} value={client.dni}>
                    {client.name} {client.last_name}
                  </option>
                ))}
              </datalist>
            </label>
            {selectedClient && (
              <p className="-mt-2 text-sm text-[#47704b]">
                Cliente: {selectedClient.name} {selectedClient.last_name}
              </p>
            )}
            {clientDni.trim() && !hasMatchingClient && !clientid && (
              <div
                className="border border-[#d9cec1] bg-[#fffaf4] p-4"
              >
                <p className="font-semibold">Cliente no registrado</p>
                <p className="mt-1 text-sm text-[#75675d]">
                  Completa sus datos para continuar con la factura.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input
                    required
                    placeholder="Nombre"
                    value={newClient.name}
                    onChange={(event) => updateNewClient("name", event.target.value)}
                    className="field-control px-3 py-2 text-sm"
                  />
                  <input
                    required
                    placeholder="Apellidos"
                    value={newClient.last_name}
                    onChange={(event) => updateNewClient("last_name", event.target.value)}
                    className="field-control px-3 py-2 text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Correo"
                    value={newClient.email}
                    onChange={(event) => updateNewClient("email", event.target.value)}
                    className="field-control px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Teléfono"
                    value={newClient.phone}
                    onChange={(event) => updateNewClient("phone", event.target.value)}
                    className="field-control px-3 py-2 text-sm"
                  />
                  <input
                    required
                    placeholder="RUC"
                    value={newClient.ruc}
                    onChange={(event) => updateNewClient("ruc", event.target.value)}
                    className="field-control px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void handleCreateClient()}
                  disabled={isCreatingClient}
                  className="action-secondary mt-4 px-4 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  {isCreatingClient ? "Creando..." : "Crear y seleccionar cliente"}
                </button>
              </div>
            )}
            <label className="block text-sm font-semibold">
              Cita relacionada
              <select
                value={effectiveAppoid}
                onChange={(event) => setAppoid(event.target.value)}
                className="field-control mt-2 w-full px-3 py-3"
              >
                <option value="">
                  {appointmentPlaceholder}
                </option>
                {availableAppointments.map((appointment) => (
                  <option key={appointment.appoid} value={appointment.appoid}>
                    {appointment.date.slice(0, 10)} · {appointment.start_time} · {appointment.description || "Cita completada"}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Método de pago
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="field-control mt-2 w-full px-3 py-3"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </label>
          </div>
          <div className="mt-8 border-t border-[#e6dbcf] pt-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl">Detalle</h3>
              <button
                type="button"
                onClick={addItem}
                className="text-sm font-semibold text-[#9b5b3b]"
              >
                + Agregar línea
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {items.map((item, index) => (
                <div
                  key={`${index}-${item.kind}`}
                  className="grid grid-cols-[1fr_4.5rem_2rem] gap-2"
                >
                  <select
                    required
                    value={`${item.kind}:${item.id}`}
                    onChange={(event) => {
                      const [kind, id] = event.target.value.split(":");
                      setItems((current) =>
                        current.map((line, lineIndex) =>
                          lineIndex === index
                            ? { ...line, kind: kind as InvoiceItem["kind"], id }
                            : line,
                        ),
                      );
                    }}
                    className="field-control min-w-0 px-3 py-2 text-sm"
                  >
                    <option value="">Selecciona un artículo</option>
                    <optgroup label="Servicios">
                      {services.map((service) => (
                        <option
                          key={`service:${service.serviceid}`}
                          value={`service:${service.serviceid}`}
                        >
                          {service.name} · ${service.price.toFixed(2)}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Productos">
                      {products.map((product) => (
                        <option
                          key={`product:${product.productid}`}
                          value={`product:${product.productid}`}
                        >
                          {product.name} · ${product.price.toFixed(2)}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <input
                    required
                    min="1"
                    type="number"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(index, "quantity", Number(event.target.value))
                    }
                    className="field-control px-2 py-2 text-center text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-lg text-[#9b3d32]"
                    aria-label="Eliminar línea"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-7 flex items-end justify-between border-t border-[#e6dbcf] pt-5">
            <span className="text-sm text-[#75675d]">Total estimado</span>
            <strong className="font-serif text-3xl">
              ${estimatedTotal.toFixed(2)}
            </strong>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="action-primary mt-6 w-full px-5 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {isSaving ? "Generando..." : "Generar factura"}
          </button>
        </form>
        <div className="panel-surface border p-6">
          <div className="flex flex-col justify-between gap-4 border-b border-[#e6dbcf] pb-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9b5b3b]">
                Historial
              </p>
              <h3 className="mt-2 font-serif text-2xl">Facturas emitidas</h3>
            </div>
            <input
              aria-label="Buscar facturas"
              placeholder="Buscar código o cliente"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="field-control w-full px-3 py-2 text-sm sm:w-56"
            />
          </div>
          {visibleInvoices.length === 0 ? (
            <p className="py-8 text-[#75675d]">No hay facturas registradas.</p>
          ) : (
            <div className="divide-y divide-[#e6dbcf]">
              {visibleInvoices.map((invoice) => (
                <button
                  type="button"
                  key={invoice.inv_heaid}
                  onClick={() => void handleSelectInvoice(invoice)}
                  className={`flex w-full items-center justify-between gap-4 py-5 text-left hover:bg-[#f4efe8] ${selectedInvoice?.inv_heaid === invoice.inv_heaid ? "bg-[#f4efe8] px-3" : ""}`}
                >
                  <div>
                    <p className="font-semibold">{invoice.code}</p>
                    <p className="mt-1 text-sm text-[#75675d]">
                      {invoice.client_name
                        ? `${invoice.client_name} ${invoice.client_last_name ?? ""}`
                        : "Venta sin cliente"}
                    </p>
                  </div>
                  <div className="text-right">
                    <strong>${Number(invoice.total).toFixed(2)}</strong>
                    <p className="mt-1 text-xs text-[#9b5b3b]">
                      {paymentLabels[invoice.payment_method] ??
                        invoice.payment_method}{" "}
                      · {statusLabels[invoice.status] ?? invoice.status}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {selectedInvoice && (
            <div className="mt-6 border-t border-[#e6dbcf] pt-6">
              <div className="flex flex-col justify-between gap-4 border-b border-[#e6dbcf] pb-5 sm:flex-row sm:items-start">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9b5b3b]">
                    Cabecera de factura
                  </p>
                  <h4 className="mt-2 font-serif text-3xl">
                    {selectedInvoice.code}
                  </h4>
                  <p className="mt-2 text-sm text-[#75675d]">
                    Cliente:{" "}
                    {selectedInvoice.client_name
                      ? `${selectedInvoice.client_name} ${selectedInvoice.client_last_name ?? ""}`
                      : "Venta sin cliente"}
                  </p>
                  <p className="mt-1 text-sm text-[#75675d]">
                    Método de pago:{" "}
                    {paymentLabels[selectedInvoice.payment_method] ??
                      selectedInvoice.payment_method}
                  </p>
                  <p className="mt-1 text-sm text-[#75675d]">
                    Estado:{" "}
                    {statusLabels[selectedInvoice.status] ??
                      selectedInvoice.status}
                  </p>
                </div>
                <div className="text-right">
                  <strong className="font-serif text-4xl">
                    ${Number(selectedInvoice.total).toFixed(2)}
                  </strong>
                  {selectedInvoice.status === "D" && (
                    <button
                      type="button"
                      onClick={() => setPendingPayment({ inv_heaid: selectedInvoice.inv_heaid, code: selectedInvoice.code, total: Number(selectedInvoice.total), paymentMethod: selectedInvoice.payment_method })}
                      className="action-primary mt-3 block px-4 py-2 text-sm font-semibold"
                    >
                      Marcar como pagada
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleSendInvoiceEmail()}
                    disabled={isSendingEmail}
                    className="action-secondary mt-3 block px-4 py-2 text-sm font-semibold disabled:opacity-60"
                  >
                    {isSendingEmail ? "Enviando..." : "Enviar comprobante por correo"}
                  </button>
                </div>
              </div>
              {isLoadingDetails && (
                <p className="py-5 text-sm text-[#75675d]">
                  Cargando detalle...
                </p>
              )}
              {invoiceDetails && (
                <div className="mt-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9b5b3b]">
                    Detalle
                  </p>
                  <div className="mt-3 divide-y divide-[#e6dbcf]">
                    {invoiceDetails.details.map((detail, index) => (
                      <div
                        key={`${detail.serviceid ?? detail.productid}-${index}`}
                        className="flex items-center justify-between gap-4 py-3 text-sm"
                      >
                        <div>
                          <p className="font-semibold">
                            {detail.service_name ??
                              detail.product_name ??
                              "Artículo"}
                          </p>
                          <p className="mt-1 text-[#75675d]">
                            {detail.quantity} × $
                            {Number(detail.unit_price).toFixed(2)}
                          </p>
                        </div>
                        <strong>${Number(detail.total).toFixed(2)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
