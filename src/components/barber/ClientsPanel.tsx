import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Client } from "./types";

type ClientForm = {
  dni: string;
  name: string;
  last_name: string;
  email: string;
  address: string;
  phone: string;
  ruc: string;
};

type ClientsPanelProps = {
  apiUrl: string;
  clients: Client[];
  onChanged: () => void;
};

const emptyForm: ClientForm = {
  dni: "",
  name: "",
  last_name: "",
  email: "",
  address: "",
  phone: "",
  ruc: "",
};

const inputClass = "field-control mt-2 w-full px-3 py-3";

async function readApiResponse(response: Response) {
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(result.detail ?? "No se pudo completar la operación");
  return result;
}

export function ClientsPanel({
  apiUrl,
  clients,
  onChanged,
}: ClientsPanelProps) {
  const [form, setForm] = useState<ClientForm>(emptyForm);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter((client) =>
      [
        client.name,
        client.last_name,
        client.dni,
        client.email,
        client.ruc,
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [clients, search]);

  function updateField(field: keyof ClientForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function clearFeedback() {
    setError("");
    setMessage("");
  }

  function startEditing(client: Client) {
    clearFeedback();
    setEditingClient(client);
    setForm({
      dni: client.dni,
      name: client.name,
      last_name: client.last_name,
      email: client.email,
      address: client.address ?? "",
      phone: client.phone ?? "",
      ruc: client.ruc,
    });
  }

  function cancelEditing() {
    setEditingClient(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();
    setIsSaving(true);
    try {
      if (editingClient) {
        await readApiResponse(
          await fetch(`${apiUrl}/api/client/${editingClient.clientid}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          }),
        );
        setMessage("Cliente actualizado correctamente.");
      } else {
        await readApiResponse(
          await fetch(`${apiUrl}/api/client`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          }),
        );
        setMessage("Cliente creado correctamente.");
      }
      cancelEditing();
      onChanged();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo guardar el cliente",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(client: Client) {
    if (!window.confirm(`¿Inactivar a ${client.name} ${client.last_name}?`))
      return;
    clearFeedback();
    setIsDeleting(client.clientid);
    try {
      await readApiResponse(
        await fetch(`${apiUrl}/api/client/${client.clientid}`, {
          method: "DELETE",
        }),
      );
      setMessage("Cliente inactivado correctamente.");
      if (editingClient?.clientid === client.clientid) cancelEditing();
      onChanged();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo inactivar el cliente",
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
            Directorio
          </p>
          <h2 className="mt-2 font-serif text-4xl">Clientes</h2>
          <p className="mt-3 max-w-2xl text-[#75675d]">
            Registra y consulta la información de las personas que visitan tu
            barbería.
          </p>
        </div>
        <span className="text-sm text-[#75675d]">{clients.length} activos</span>
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
        <div className="panel-surface border p-6">
          <div className="flex flex-col justify-between gap-4 border-b border-[#e6dbcf] pb-5 sm:flex-row sm:items-center">
            <h3 className="font-serif text-2xl">Directorio activo</h3>
            <input
              aria-label="Buscar clientes"
              placeholder="Buscar por nombre, DNI o correo"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="field-control w-full px-3 py-2 text-sm sm:w-64"
            />
          </div>
          {filteredClients.length === 0 ? (
            <p className="py-8 text-[#75675d]">
              {clients.length === 0
                ? "Todavía no hay clientes registrados."
                : "No encontramos clientes con esa búsqueda."}
            </p>
          ) : (
            <div className="divide-y divide-[#e6dbcf]">
              {filteredClients.map((client) => (
                <div
                  key={client.clientid}
                  className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <h4 className="font-semibold">
                      {client.name} {client.last_name}
                    </h4>
                    <p className="mt-1 truncate text-sm text-[#75675d]">
                      DNI {client.dni} · {client.email}
                    </p>
                    <p className="mt-1 text-xs text-[#9b5b3b]">
                      RUC: {client.ruc}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm font-semibold sm:shrink-0">
                    <button
                      type="button"
                      onClick={() => startEditing(client)}
                      className="text-[#9b5b3b] hover:text-[#2c2520]"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(client)}
                      disabled={isDeleting === client.clientid}
                      className="text-[#9b3d32] hover:text-[#6e2b25] disabled:opacity-50"
                    >
                      {isDeleting === client.clientid
                        ? "Inactivando..."
                        : "Inactivar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="panel-surface h-fit border p-6"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9b5b3b]">
            {editingClient ? "Editar cliente" : "Nuevo cliente"}
          </p>
          <h3 className="mt-2 font-serif text-2xl">
            {editingClient
              ? `${editingClient.name} ${editingClient.last_name}`
              : "Agregar al directorio"}
          </h3>
          <div className="mt-6 space-y-5">
            <label className="block text-sm font-semibold">
              DNI
              <input
                required
                value={form.dni}
                onChange={(event) => updateField("dni", event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-semibold">
              Nombre
              <input
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-semibold">
              Apellidos
              <input
                required
                value={form.last_name}
                onChange={(event) =>
                  updateField("last_name", event.target.value)
                }
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-semibold">
              Correo
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-semibold">
              RUC
              <input
                required
                value={form.ruc}
                onChange={(event) => updateField("ruc", event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-semibold">
              Teléfono
              <input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-semibold">
              Dirección
              <input
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
                className={inputClass}
              />
            </label>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="action-primary px-5 py-3 text-sm font-semibold disabled:opacity-60"
            >
              {isSaving
                ? "Guardando..."
                : editingClient
                  ? "Actualizar cliente"
                  : "Crear cliente"}
            </button>
            {editingClient && (
              <button
                type="button"
                onClick={cancelEditing}
                className="action-secondary px-5 py-3 text-sm font-semibold"
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
