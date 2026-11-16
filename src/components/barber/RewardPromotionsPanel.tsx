import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { AuthenticatedUser, RewardPromotion, Service } from "./types";

type PromotionForm = {
  name: string;
  description: string;
  points_required: string;
  serviceid: string;
};

type RewardPromotionsPanelProps = {
  apiUrl: string;
  user: AuthenticatedUser;
  sessionToken: string;
  services: Service[];
  onChanged: () => void;
};

const emptyForm: PromotionForm = {
  name: "",
  description: "",
  points_required: "5",
  serviceid: "",
};

const inputClass = "field-control mt-2 w-full px-3 py-3";

async function readApiResponse(response: Response) {
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(result.detail ?? "No se pudo completar la operación");
  return result;
}

async function fetchPromotions(apiUrl: string, sessionToken: string) {
  const response = await fetch(`${apiUrl}/api/reward-promotions?include_inactive=true`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  return (await readApiResponse(response)) as RewardPromotion[];
}

export function RewardPromotionsPanel({
  apiUrl,
  user,
  sessionToken,
  services,
  onChanged,
}: RewardPromotionsPanelProps) {
  const [promotions, setPromotions] = useState<RewardPromotion[]>([]);
  const [form, setForm] = useState<PromotionForm>(emptyForm);
  const [editingPromotion, setEditingPromotion] = useState<RewardPromotion | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchPromotions(apiUrl, sessionToken)
      .then((items) => {
        if (!cancelled) setPromotions(items);
      })
      .catch((loadError: unknown) => {
        if (!cancelled)
          setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los canjes");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiUrl, sessionToken]);

  function updateField(field: keyof PromotionForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingPromotion(null);
  }

  async function reload() {
    setPromotions(await fetchPromotions(apiUrl, sessionToken));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      points_required: Number(form.points_required),
      serviceid: form.serviceid ? Number(form.serviceid) : null,
      ...(editingPromotion ? { active: editingPromotion.active } : {}),
    };
    try {
      await readApiResponse(
        await fetch(
          editingPromotion
            ? `${apiUrl}/api/reward-promotions/${editingPromotion.promotionid}`
            : `${apiUrl}/api/reward-promotions`,
          {
            method: editingPromotion ? "PUT" : "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
            body: JSON.stringify(payload),
          },
        ),
      );
      await reload();
      onChanged();
      setMessage(editingPromotion ? "Canje actualizado correctamente." : "Canje creado correctamente.");
      resetForm();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el canje");
    } finally {
      setIsSaving(false);
    }
  }

  function startEditing(promotion: RewardPromotion) {
    setError("");
    setMessage("");
    setEditingPromotion(promotion);
    setForm({
      name: promotion.name,
      description: promotion.description,
      points_required: String(promotion.points_required),
      serviceid: promotion.serviceid ? String(promotion.serviceid) : "",
    });
  }

  async function toggleStatus(promotion: RewardPromotion) {
    setError("");
    setMessage("");
    setUpdatingId(promotion.promotionid);
    try {
      await readApiResponse(
        await fetch(`${apiUrl}/api/reward-promotions/${promotion.promotionid}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
          body: JSON.stringify({ active: !promotion.active }),
        }),
      );
      await reload();
      onChanged();
      setMessage(promotion.active ? "Canje inhabilitado." : "Canje habilitado.");
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "No se pudo cambiar el estado");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="py-8">
      <div className="border-b border-[#d9cec1] pb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b5b3b]">
          Programa de puntos
        </p>
        <h2 className="mt-2 font-serif text-4xl">Canjes y Promociones</h2>
        <p className="mt-3 max-w-2xl text-[#65716b]">
          Define cuántos puntos cuesta cada beneficio y qué servicio se entrega al canjearlo.
        </p>
      </div>

      {error && <p className="mt-5 border border-[#e5b8ae] bg-[#fff4f1] p-4 text-sm text-[#9b3d32]">{error}</p>}
      {message && <p className="mt-5 border border-[#b8d0b9] bg-[#f2faf2] p-4 text-sm text-[#47704b]">{message}</p>}

      <div className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <section className="panel-surface border p-6">
          <div className="flex items-end justify-between gap-4 border-b border-[#e6dbcf] pb-5">
            <div>
              <p className="panel-kicker text-sm font-semibold uppercase">Catálogo</p>
              <h3 className="mt-2 font-serif text-2xl">Beneficios disponibles</h3>
            </div>
            <span className="text-sm text-[#65716b]">{promotions.filter((item) => item.active).length} activos</span>
          </div>
          {isLoading ? (
            <p className="py-8 text-sm text-[#65716b]">Cargando canjes...</p>
          ) : promotions.length === 0 ? (
            <p className="py-8 text-sm text-[#65716b]">Aún no hay canjes configurados.</p>
          ) : (
            <div className="divide-y divide-[#e6dbcf]">
              {promotions.map((promotion) => (
                <article key={promotion.promotionid} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold">{promotion.name}</h4>
                      <span className={`px-2 py-1 text-xs font-semibold ${promotion.active ? "bg-[#e9f4eb] text-[#37634f]" : "bg-[#f1eeeb] text-[#75675d]"}`}>
                        {promotion.active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#65716b]">{promotion.description || "Sin descripción"}</p>
                    <p className="mt-2 text-xs font-semibold text-[#1d5b4f]">
                      {promotion.points_required} puntos{promotion.service_name ? ` · ${promotion.service_name}` : " · Beneficio general"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-4 text-sm font-semibold">
                    <button type="button" onClick={() => startEditing(promotion)} className="text-[#9b5b3b] hover:text-[#2c2520]">Editar</button>
                    <button
                      type="button"
                      onClick={() => void toggleStatus(promotion)}
                      disabled={updatingId === promotion.promotionid}
                      className={promotion.active ? "text-[#9b3d32] hover:text-[#6e2b25] disabled:opacity-50" : "text-[#1d5b4f] hover:text-[#153e38] disabled:opacity-50"}
                    >
                      {updatingId === promotion.promotionid ? "Actualizando..." : promotion.active ? "Inhabilitar" : "Habilitar"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <form onSubmit={handleSubmit} className="panel-surface border p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9b5b3b]">
            {editingPromotion ? "Editar canje" : "Nuevo canje"}
          </p>
          <div className="mt-5 space-y-4">
            <label className="block text-sm font-semibold">
              Nombre del beneficio
              <input required maxLength={120} value={form.name} onChange={(event) => updateField("name", event.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm font-semibold">
              Puntos necesarios
              <input required type="number" min="1" step="1" value={form.points_required} onChange={(event) => updateField("points_required", event.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm font-semibold">
              Servicio incluido
              <select value={form.serviceid} onChange={(event) => updateField("serviceid", event.target.value)} className={inputClass}>
                <option value="">Beneficio general</option>
                {services.map((service) => <option key={service.serviceid} value={service.serviceid}>{service.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Descripción
              <textarea maxLength={500} rows={3} value={form.description} onChange={(event) => updateField("description", event.target.value)} className={inputClass} />
            </label>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" disabled={isSaving || !user.userid || !sessionToken} className="action-primary px-5 py-3 text-sm font-semibold disabled:opacity-60">
              {isSaving ? "Guardando..." : editingPromotion ? "Actualizar canje" : "Crear canje"}
            </button>
            {editingPromotion && <button type="button" onClick={resetForm} className="action-secondary px-5 py-3 text-sm font-semibold">Cancelar</button>}
          </div>
        </form>
      </div>
    </section>
  );
}
