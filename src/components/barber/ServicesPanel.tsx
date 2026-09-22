import { useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import type { AuthenticatedUser, Service } from "./types";

type ServiceForm = {
  name: string;
  duration: string;
  price: string;
  status: boolean;
  image: File | null;
};

type ServicesPanelProps = {
  apiUrl: string;
  user: AuthenticatedUser;
  services: Service[];
  onChanged: () => void;
};

const emptyForm: ServiceForm = {
  name: "",
  duration: "30",
  price: "",
  status: true,
  image: null,
};

const inputClass = "field-control mt-2 w-full px-3 py-3";

async function readApiResponse(response: Response) {
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(result.detail ?? "No se pudo completar la operación");
  return result;
}

export function ServicesPanel({
  apiUrl,
  user,
  services,
  onChanged,
}: ServicesPanelProps) {
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDisabling, setIsDisabling] = useState<number | null>(null);

  function updateField(
    field: keyof ServiceForm,
    value: string | boolean | File | null,
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function clearFeedback() {
    setError("");
    setMessage("");
  }

  function startEditing(service: Service) {
    clearFeedback();
    setEditingService(service);
    setForm({
      name: service.name,
      duration: String(service.duration),
      price: String(service.price),
      status: true,
      image: null,
    });
  }

  function cancelEditing() {
    setEditingService(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();
    setIsSaving(true);

    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("duration", form.duration);
      payload.append("price", form.price);
      payload.append("status", String(form.status));
      if (form.image) payload.append("image", form.image);

      if (editingService) {
        await readApiResponse(
          await fetch(`${apiUrl}/api/services/${editingService.serviceid}`, {
            method: "PUT",
            body: payload,
          }),
        );
        setMessage("Servicio actualizado correctamente.");
      } else {
        await readApiResponse(
          await fetch(`${apiUrl}/api/services`, {
            method: "POST",
            body: payload,
          }),
        );
        setMessage("Servicio creado correctamente.");
      }
      cancelEditing();
      onChanged();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo guardar el servicio",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDisable(service: Service) {
    clearFeedback();
    setIsDisabling(service.serviceid);
    try {
      await readApiResponse(
        await fetch(`${apiUrl}/api/services/${service.serviceid}`, {
          method: "DELETE",
        }),
      );
      setMessage("Servicio eliminado correctamente.");
      if (editingService?.serviceid === service.serviceid) cancelEditing();
      onChanged();
    } catch (disableError) {
      setError(
        disableError instanceof Error
          ? disableError.message
          : "No se pudo inactivar el servicio",
      );
    } finally {
      setIsDisabling(null);
    }
  }

  const canManageServices = user.role === "adm";
  const getImageUrl = (imagePath: string) =>
    imagePath.startsWith("http")
      ? imagePath
      : `${apiUrl.replace(/\/$/, "")}/${imagePath.replace(/^\/+/, "")}`;

  return (
    <section className="py-8">
      <div className="flex flex-col justify-between gap-5 border-b border-[#d9cec1] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b5b3b]">
            Catálogo
          </p>
          <h2 className="mt-2 font-serif text-4xl">Servicios</h2>
          <p className="mt-3 max-w-2xl text-[#75675d]">
            Administra los servicios que tus clientes pueden solicitar y
            consulta duración y precio.
          </p>
        </div>
        <span className="text-sm text-[#75675d]">
          {services.length} activos
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

      <div
        className={`mt-8 grid gap-8 ${canManageServices ? "lg:grid-cols-[1.35fr_0.65fr]" : "lg:grid-cols-1"}`}
      >
        <div className="panel-surface border p-6">
          <div className="mb-4 flex items-center justify-between border-b border-[#e6dbcf] pb-4">
            <h3 className="font-serif text-2xl">Servicios activos</h3>
            <span className="text-xs uppercase tracking-[0.14em] text-[#75675d]">
              Precio / duración
            </span>
          </div>
          {services.length === 0 ? (
            <p className="py-8 text-[#75675d]">
              Todavía no hay servicios activos.
            </p>
          ) : (
            <div className="divide-y divide-[#e6dbcf]">
              {services.map((service) => (
                <div
                  key={service.serviceid}
                  className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    {service.img_url ? (
                        <Image
                        src={getImageUrl(service.img_url)}
                        alt={`Referencia de ${service.name}`}
                          width={64}
                          height={64}
                          unoptimized
                          className="h-16 w-16 shrink-0 object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-[#f4efe8] text-xs text-[#75675d]">
                        Sin imagen
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold">{service.name}</h4>
                      <p className="mt-1 text-sm text-[#75675d]">
                        {service.duration} minutos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-5 sm:justify-end">
                    <strong>${service.price.toFixed(2)}</strong>
                    {canManageServices && (
                      <div className="flex gap-3 text-sm font-semibold">
                        <button
                          type="button"
                          onClick={() => startEditing(service)}
                          className="text-[#9b5b3b] hover:text-[#2c2520]"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDisable(service)}
                          disabled={isDisabling === service.serviceid}
                          className="text-[#9b3d32] hover:text-[#6e2b25] disabled:opacity-50"
                        >
                          {isDisabling === service.serviceid
                            ? "Inactivando..."
                            : "Inactivar"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {canManageServices && (
          <form
            onSubmit={handleSubmit}
            className="panel-surface h-fit border p-6"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9b5b3b]">
              {editingService ? "Editar servicio" : "Nuevo servicio"}
            </p>
            <h3 className="mt-2 font-serif text-2xl">
              {editingService ? editingService.name : "Agregar al catálogo"}
            </h3>
            <div className="mt-6 space-y-5">
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
                Duración en minutos
                <input
                  required
                  min="1"
                  type="number"
                  value={form.duration}
                  onChange={(event) =>
                    updateField("duration", event.target.value)
                  }
                  className={inputClass}
                />
              </label>
              <label className="block text-sm font-semibold">
                Precio
                <input
                  required
                  min="0"
                  step="0.01"
                  type="number"
                  value={form.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm font-semibold">
                Imagen de referencia
                <input
                  accept="image/jpeg,image/png,image/webp"
                  type="file"
                  onChange={(event) =>
                    updateField("image", event.target.files?.[0] ?? null)
                  }
                  className="mt-3 block w-full text-sm text-[#75675d] file:mr-4 file:border-0 file:bg-[#f4efe8] file:px-3 file:py-2 file:font-semibold file:text-[#2c2520]"
                />
              </label>
              {editingService?.img_url && !form.image && (
                <Image
                  src={getImageUrl(editingService.img_url)}
                  alt={`Imagen actual de ${editingService.name}`}
                  width={640}
                  height={192}
                  unoptimized
                  className="h-32 w-full object-cover"
                />
              )}
              {form.image && (
                <Image
                  src={URL.createObjectURL(form.image)}
                  alt="Vista previa de la imagen seleccionada"
                  width={640}
                  height={192}
                  unoptimized
                  className="h-32 w-full object-cover"
                />
              )}
              {!editingService && (
                <label className="flex items-center gap-3 pt-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={form.status}
                    onChange={(event) =>
                      updateField("status", event.target.checked)
                    }
                  />{" "}
                  Servicio activo
                </label>
              )}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="action-primary px-5 py-3 text-sm font-semibold disabled:opacity-60"
              >
                {isSaving
                  ? "Guardando..."
                  : editingService
                    ? "Actualizar servicio"
                    : "Crear servicio"}
              </button>
              {editingService && (
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
        )}
      </div>
    </section>
  );
}
