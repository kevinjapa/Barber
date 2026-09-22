import type { Service } from "./types";

type DashboardViewProps = {
  services: Service[];
  isLoading: boolean;
  hasError: boolean;
};

export function DashboardView({ services, isLoading, hasError }: DashboardViewProps) {
  return (
    <>
      <section className="grid gap-4 py-8 sm:grid-cols-3">
        {[["Citas de hoy", "12", "+3 vs. ayer"], ["Ingresos estimados", "$286", "8 servicios"], ["Clientes nuevos", "4", "Esta semana"]].map(([label, value, detail]) => (
          <article key={label} className="border border-[#d9cec1] bg-[#fffaf4] p-5">
            <p className="text-sm text-[#75675d]">{label}</p>
            <div className="mt-5 flex items-end justify-between"><strong className="font-serif text-4xl font-normal">{value}</strong><span className="text-xs font-semibold text-[#9b5b3b]">{detail}</span></div>
          </article>
        ))}
      </section>
      <section className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <article className="border border-[#d9cec1] bg-[#fffaf4] p-6">
          <div className="mb-6 flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b5b3b]">Catálogo</p><h2 className="mt-2 font-serif text-3xl">Servicios activos</h2></div><span className="text-sm text-[#75675d]">API Python</span></div>
          {isLoading && <p className="text-[#75675d]">Cargando servicios...</p>}
          {hasError && <p className="text-[#9b3d32]">No se pudo conectar con la API. Inicia FastAPI en el puerto 8000.</p>}
          {!isLoading && !hasError && <div className="divide-y divide-[#e6dbcf]">{services.map((service) => <div key={service.serviceid} className="flex items-center justify-between py-4"><div><h3 className="font-semibold">{service.name}</h3><p className="mt-1 text-sm text-[#75675d]">{service.duration} minutos</p></div><strong>${service.price.toFixed(2)}</strong></div>)}</div>}
        </article>
        <article className="bg-[#c8754e] p-6 text-[#fffaf4]"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f9d3be]">Siguiente paso</p><h2 className="mt-8 font-serif text-4xl leading-tight">Conecta tu agenda con tus clientes.</h2><p className="mt-5 leading-7 text-[#f9e1d3]">La pantalla ya consume datos reales del servicio REST. El próximo módulo será guardar citas en Supabase.</p></article>
      </section>
    </>
  );
}
