import { useState } from "react";
import type { FormEvent } from "react";
import type { AuthenticatedUser, Product } from "./types";

type ProductForm = {
  name: string;
  code: string;
  stock: string;
  price: string;
  description: string;
};

type ProductsPanelProps = {
  apiUrl: string;
  user: AuthenticatedUser;
  products: Product[];
  onChanged: () => void;
};

const emptyForm: ProductForm = {
  name: "",
  code: "",
  stock: "0",
  price: "",
  description: "",
};

const inputClass = "field-control mt-2 w-full px-3 py-3";

async function readApiResponse(response: Response) {
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.detail ?? "No se pudo completar la operación");
  }
  return result;
}

export function ProductsPanel({
  apiUrl,
  user,
  products,
  onChanged,
}: Readonly<ProductsPanelProps>) {
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDisabling, setIsDisabling] = useState<number | null>(null);

  function updateField(field: keyof ProductForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function clearFeedback() {
    setError("");
    setMessage("");
  }

  function startEditing(product: Product) {
    clearFeedback();
    setEditingProduct(product);
    setForm({
      name: product.name,
      code: product.code,
      stock: String(product.stock),
      price: String(product.price),
      description: product.description ?? "",
    });
  }

  function cancelEditing() {
    setEditingProduct(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();
    setIsSaving(true);
    try {
      if (editingProduct) {
        await readApiResponse(
          await fetch(`${apiUrl}/api/products/${editingProduct.productid}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.name,
              code: form.code,
              stock: form.stock,
              price: Number(form.price),
              description: form.description,
            }),
          }),
        );
        setMessage("Producto actualizado correctamente.");
      } else {
        const payload = new FormData();
        payload.append("name", form.name);
        payload.append("code", form.code);
        payload.append("stock", form.stock);
        payload.append("price", form.price);
        payload.append("status", "A");
        payload.append("description", form.description);
        await readApiResponse(
          await fetch(`${apiUrl}/api/products`, {
            method: "POST",
            body: payload,
          }),
        );
        setMessage("Producto creado correctamente.");
      }
      cancelEditing();
      onChanged();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo guardar el producto",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDisable(product: Product) {
    clearFeedback();
    setIsDisabling(product.productid);
    try {
      await readApiResponse(
        await fetch(`${apiUrl}/api/products/${product.productid}/status`, {
          method: "PATCH",
        }),
      );
      setMessage("Producto inactivado correctamente.");
      if (editingProduct?.productid === product.productid) cancelEditing();
      onChanged();
    } catch (disableError) {
      setError(
        disableError instanceof Error
          ? disableError.message
          : "No se pudo inactivar el producto",
      );
    } finally {
      setIsDisabling(null);
    }
  }

  const canManageProducts = user.role === "adm";
  const submitLabel = isSaving
    ? "Guardando..."
    : editingProduct
      ? "Actualizar producto"
      : "Crear producto";

  return (
    <section className="py-8">
      <div className="flex flex-col justify-between gap-5 border-b border-[#d9cec1] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b5b3b]">
            Catálogo
          </p>
          <h2 className="mt-2 font-serif text-4xl">Productos</h2>
          <p className="mt-3 max-w-2xl text-[#75675d]">
            Administra los productos disponibles para la venta y controla su inventario.
          </p>
        </div>
        <span className="text-sm text-[#75675d]">{products.length} activos</span>
      </div>

      {error && <p className="mt-5 border border-[#e5b8ae] bg-[#fff4f1] p-4 text-sm text-[#9b3d32]">{error}</p>}
      {message && <p className="mt-5 border border-[#b8d0b9] bg-[#f2faf2] p-4 text-sm text-[#47704b]">{message}</p>}

      <div className={`mt-8 grid gap-8 ${canManageProducts ? "lg:grid-cols-[1.35fr_0.65fr]" : "lg:grid-cols-1"}`}>
        <div className="panel-surface border p-6">
          <div className="mb-4 flex items-center justify-between border-b border-[#e6dbcf] pb-4">
            <h3 className="font-serif text-2xl">Productos activos</h3>
            <span className="text-xs uppercase tracking-[0.14em] text-[#75675d]">Stock / precio</span>
          </div>
          {products.length === 0 ? (
            <p className="py-8 text-[#75675d]">Todavía no hay productos activos.</p>
          ) : (
            <div className="divide-y divide-[#e6dbcf]">
              {products.map((product) => (
                <div key={product.productid} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="font-semibold">{product.name}</h4>
                    <p className="mt-1 text-sm text-[#75675d]">Código: {product.code} · Stock: {product.stock}</p>
                    {product.description && <p className="mt-1 text-sm text-[#75675d]">{product.description}</p>}
                  </div>
                  <div className="flex items-center justify-between gap-5 sm:justify-end">
                    <strong>${Number(product.price).toFixed(2)}</strong>
                    {canManageProducts && (
                      <div className="flex gap-3 text-sm font-semibold">
                        <button type="button" onClick={() => startEditing(product)} className="text-[#9b5b3b] hover:text-[#2c2520]">Editar</button>
                        <button type="button" onClick={() => void handleDisable(product)} disabled={isDisabling === product.productid} className="text-[#9b3d32] hover:text-[#6e2b25] disabled:opacity-50">
                          {isDisabling === product.productid ? "Inactivando..." : "Inactivar"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {canManageProducts && (
          <form onSubmit={handleSubmit} className="panel-surface h-fit border p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9b5b3b]">{editingProduct ? "Editar producto" : "Nuevo producto"}</p>
            <h3 className="mt-2 font-serif text-2xl">{editingProduct ? editingProduct.name : "Agregar al catálogo"}</h3>
            <div className="mt-6 space-y-5">
              <label className="block text-sm font-semibold">Nombre<input required value={form.name} onChange={(event) => updateField("name", event.target.value)} className={inputClass} /></label>
              <label className="block text-sm font-semibold">Código<input required value={form.code} onChange={(event) => updateField("code", event.target.value)} className={inputClass} /></label>
              <label className="block text-sm font-semibold">Stock<input required min="0" type="number" value={form.stock} onChange={(event) => updateField("stock", event.target.value)} className={inputClass} /></label>
              <label className="block text-sm font-semibold">Precio<input required min="0" step="0.01" type="number" value={form.price} onChange={(event) => updateField("price", event.target.value)} className={inputClass} /></label>
              <label className="block text-sm font-semibold">Descripción<textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} className={`${inputClass} min-h-24`} /></label>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="submit" disabled={isSaving} className="action-primary px-5 py-3 text-sm font-semibold disabled:opacity-60">{submitLabel}</button>
              {editingProduct && <button type="button" onClick={cancelEditing} className="action-secondary px-5 py-3 text-sm font-semibold">Cancelar</button>}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}