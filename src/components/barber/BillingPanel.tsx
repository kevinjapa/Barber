import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Appointment, Client, Invoice, InvoiceWithDetails, Product, Service } from "./types";

type InvoiceItem = {
  kind: "service" | "product";
  id: string;
  quantity: number;
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

const paymentLabels: Record<string, string> = { E: "Efectivo", T: "Tarjeta", R: "Transferencia" };
const statusLabels: Record<string, string> = { P: "Pagada", C: "Cancelada" };

async function readApiResponse(response: Response) {
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.detail ?? "No se pudo completar la operación");
  return result;
}

function createCode() {
  return `FAC-${Date.now().toString().slice(-8)}`;
}

export function BillingPanel({ apiUrl, clients, appointments, services, products, invoices, onChanged }: BillingPanelProps) {
  const [code, setCode] = useState(createCode);
  const [clientid, setClientid] = useState("");
  const [appoid, setAppoid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [items, setItems] = useState<InvoiceItem[]>([{ kind: "service", id: "", quantity: 1 }]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceWithDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [query, setQuery] = useState("");

  const visibleInvoices = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return invoices;
    return invoices.filter((invoice) => `${invoice.code} ${invoice.client_name ?? ""} ${invoice.client_last_name ?? ""}`.toLowerCase().includes(normalized));
  }, [invoices, query]);

  function updateItem(index: number, field: keyof InvoiceItem, value: string | number) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  }

  function addItem() {
    setItems((current) => [...current, { kind: "service", id: "", quantity: 1 }]);
  }

  function removeItem(index: number) {
    setItems((current) => current.length === 1 ? current : current.filter((_, itemIndex) => itemIndex !== index));
  }

  function getItemPrice(item: InvoiceItem) {
    if (item.kind === "service") {
      return services.find((service) => service.serviceid === Number(item.id))?.price ?? 0;
    }
    return products.find((product) => product.productid === Number(item.id))?.price ?? 0;
  }

  const estimatedTotal = items.reduce((total, item) => total + getItemPrice(item) * item.quantity, 0);

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
      const response = await fetch(`${apiUrl}/api/invoices/${invoice.inv_heaid}`);
      const result = await readApiResponse(response) as InvoiceWithDetails;
      setInvoiceDetails(result);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : "No se pudo cargar el detalle de la factura");
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
      const details = items.map((item) => ({ [item.kind === "service" ? "serviceid" : "productid"]: Number(item.id), quantity: item.quantity }));
      if (details.some((detail) => !Object.values(detail)[0])) throw new Error("Selecciona un producto o servicio en cada línea");
      await readApiResponse(await fetch(`${apiUrl}/api/invoices`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, payment_method: paymentMethod, status: "pagada", clientid: clientid ? Number(clientid) : null, appoid: appoid ? Number(appoid) : null, details }) }));
      setMessage("Factura creada correctamente.");
      setCode(createCode());
      setClientid("");
      setAppoid("");
      setItems([{ kind: "service", id: "", quantity: 1 }]);
      onChanged();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo crear la factura");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="py-8">
      <div className="border-b border-[#d9cec1] pb-6"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b5b3b]">Caja</p><h2 className="mt-2 font-serif text-4xl">Facturación</h2><p className="mt-3 max-w-2xl text-[#75675d]">Genera comprobantes con los servicios y productos vendidos, y consulta el historial.</p></div>
      {error && <p className="mt-5 border border-[#e5b8ae] bg-[#fff4f1] p-4 text-sm text-[#9b3d32]">{error}</p>}
      {message && <p className="mt-5 border border-[#b8d0b9] bg-[#f2faf2] p-4 text-sm text-[#47704b]">{message}</p>}
      <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <form onSubmit={handleSubmit} className="h-fit border border-[#d9cec1] bg-[#fffaf4] p-6"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9b5b3b]">Nueva factura</p><div className="mt-6 space-y-5"><label className="block text-sm font-semibold">Código<input required value={code} onChange={(event) => setCode(event.target.value)} className="mt-2 w-full border-b border-[#cbbdaf] bg-transparent px-0 py-3 outline-none focus:border-[#c8754e]" /></label><label className="block text-sm font-semibold">Cliente<select value={clientid} onChange={(event) => setClientid(event.target.value)} className="mt-2 w-full border-b border-[#cbbdaf] bg-transparent py-3 outline-none focus:border-[#c8754e]"><option value="">Venta sin cliente</option>{clients.map((client) => <option key={client.clientid} value={client.clientid}>{client.name} {client.last_name} · {client.dni}</option>)}</select></label><label className="block text-sm font-semibold">Cita relacionada<select value={appoid} onChange={(event) => setAppoid(event.target.value)} className="mt-2 w-full border-b border-[#cbbdaf] bg-transparent py-3 outline-none focus:border-[#c8754e]"><option value="">Sin cita</option>{appointments.map((appointment) => <option key={appointment.appoid} value={appointment.appoid}>{appointment.client_name} {appointment.client_last_name} · {appointment.date.slice(0, 10)}</option>)}</select></label><label className="block text-sm font-semibold">Método de pago<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="mt-2 w-full border-b border-[#cbbdaf] bg-transparent py-3 outline-none focus:border-[#c8754e]"><option value="efectivo">Efectivo</option><option value="tarjeta">Tarjeta</option><option value="transferencia">Transferencia</option></select></label></div><div className="mt-8 border-t border-[#e6dbcf] pt-5"><div className="flex items-center justify-between"><h3 className="font-serif text-xl">Detalle</h3><button type="button" onClick={addItem} className="text-sm font-semibold text-[#9b5b3b]">+ Agregar línea</button></div><div className="mt-4 space-y-4">{items.map((item, index) => <div key={`${index}-${item.kind}`} className="grid grid-cols-[1fr_4.5rem_2rem] gap-2"><select required value={`${item.kind}:${item.id}`} onChange={(event) => { const [kind, id] = event.target.value.split(":"); setItems((current) => current.map((line, lineIndex) => lineIndex === index ? { ...line, kind: kind as InvoiceItem["kind"], id } : line)); }} className="min-w-0 border-b border-[#cbbdaf] bg-transparent py-2 text-sm outline-none focus:border-[#c8754e]"><option value="">Selecciona un artículo</option><optgroup label="Servicios">{services.map((service) => <option key={`service:${service.serviceid}`} value={`service:${service.serviceid}`}>{service.name} · ${service.price.toFixed(2)}</option>)}</optgroup><optgroup label="Productos">{products.map((product) => <option key={`product:${product.productid}`} value={`product:${product.productid}`}>{product.name} · ${product.price.toFixed(2)}</option>)}</optgroup></select><input required min="1" type="number" value={item.quantity} onChange={(event) => updateItem(index, "quantity", Number(event.target.value))} className="border-b border-[#cbbdaf] bg-transparent py-2 text-center text-sm outline-none focus:border-[#c8754e]" /><button type="button" onClick={() => removeItem(index)} className="text-lg text-[#9b3d32]" aria-label="Eliminar línea">×</button></div>)}</div></div><div className="mt-7 flex items-end justify-between border-t border-[#e6dbcf] pt-5"><span className="text-sm text-[#75675d]">Total estimado</span><strong className="font-serif text-3xl">${estimatedTotal.toFixed(2)}</strong></div><button type="submit" disabled={isSaving} className="mt-6 w-full bg-[#c8754e] px-5 py-3 text-sm font-semibold text-[#fffaf4] disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? "Generando..." : "Generar factura"}</button></form>
        <div className="border border-[#d9cec1] bg-[#fffaf4] p-6"><div className="flex flex-col justify-between gap-4 border-b border-[#e6dbcf] pb-5 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9b5b3b]">Historial</p><h3 className="mt-2 font-serif text-2xl">Facturas emitidas</h3></div><input aria-label="Buscar facturas" placeholder="Buscar código o cliente" value={query} onChange={(event) => setQuery(event.target.value)} className="border-b border-[#cbbdaf] bg-transparent px-0 py-2 text-sm outline-none focus:border-[#c8754e] sm:w-56" /></div>{visibleInvoices.length === 0 ? <p className="py-8 text-[#75675d]">No hay facturas registradas.</p> : <div className="divide-y divide-[#e6dbcf]">{visibleInvoices.map((invoice) => <button type="button" key={invoice.inv_heaid} onClick={() => void handleSelectInvoice(invoice)} className={`flex w-full items-center justify-between gap-4 py-5 text-left hover:bg-[#f4efe8] ${selectedInvoice?.inv_heaid === invoice.inv_heaid ? "bg-[#f4efe8] px-3" : ""}`}><div><p className="font-semibold">{invoice.code}</p><p className="mt-1 text-sm text-[#75675d]">{invoice.client_name ? `${invoice.client_name} ${invoice.client_last_name ?? ""}` : "Venta sin cliente"}</p></div><div className="text-right"><strong>${Number(invoice.total).toFixed(2)}</strong><p className="mt-1 text-xs text-[#9b5b3b]">{paymentLabels[invoice.payment_method] ?? invoice.payment_method} · {statusLabels[invoice.status] ?? invoice.status}</p></div></button>)}</div>}{selectedInvoice && <div className="mt-6 border-t border-[#e6dbcf] pt-6"><div className="flex flex-col justify-between gap-4 border-b border-[#e6dbcf] pb-5 sm:flex-row sm:items-start"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9b5b3b]">Cabecera de factura</p><h4 className="mt-2 font-serif text-3xl">{selectedInvoice.code}</h4><p className="mt-2 text-sm text-[#75675d]">Cliente: {selectedInvoice.client_name ? `${selectedInvoice.client_name} ${selectedInvoice.client_last_name ?? ""}` : "Venta sin cliente"}</p><p className="mt-1 text-sm text-[#75675d]">Método de pago: {paymentLabels[selectedInvoice.payment_method] ?? selectedInvoice.payment_method}</p><p className="mt-1 text-sm text-[#75675d]">Estado: {statusLabels[selectedInvoice.status] ?? selectedInvoice.status}</p></div><strong className="font-serif text-4xl">${Number(selectedInvoice.total).toFixed(2)}</strong></div>{isLoadingDetails && <p className="py-5 text-sm text-[#75675d]">Cargando detalle...</p>}{invoiceDetails && <div className="mt-5"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9b5b3b]">Detalle</p><div className="mt-3 divide-y divide-[#e6dbcf]">{invoiceDetails.details.map((detail, index) => <div key={`${detail.serviceid ?? detail.productid}-${index}`} className="flex items-center justify-between gap-4 py-3 text-sm"><div><p className="font-semibold">{detail.service_name ?? detail.product_name ?? "Artículo"}</p><p className="mt-1 text-[#75675d]">{detail.quantity} × ${Number(detail.unit_price).toFixed(2)}</p></div><strong>${Number(detail.total).toFixed(2)}</strong></div>)}</div></div>}</div>}</div>
      </div>
    </section>
  );
}
