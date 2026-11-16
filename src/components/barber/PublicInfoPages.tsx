import { PublicPage } from "./PublicDirectoryPage";

export function AboutPage() {
  return <PublicPage kicker="Alva Academy" title="Una experiencia hecha para que vuelvas"><div className="public-copy"><p>Creemos que una visita a la barbería es más que un corte: es tiempo para ti, conversación y confianza.</p><p>Trabajamos con productos seleccionados, técnicas actuales y un equipo que cuida cada detalle.</p></div></PublicPage>;
}

export function WorksPage() {
  return <PublicPage kicker="Portafolio" title="Trabajos que hablan por sí solos"><div className="public-grid sm:grid-cols-2 lg:grid-cols-3">{["Cortes clásicos", "Barba definida", "Estilo contemporáneo"].map((work) => <article className="public-card public-work" key={work}><div className="public-work-placeholder">Alva</div><div className="p-5"><h2 className="font-serif text-2xl text-[#153e38]">{work}</h2><p className="mt-2 text-sm text-[#718078]">Diseñado para tu estilo y tu rutina.</p></div></article>)}</div></PublicPage>;
}

export function LocationPage() {
  return <PublicPage kicker="Encuéntranos" title="Tu próxima visita empieza aquí"><div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><div className="public-card p-7"><h2 className="font-serif text-3xl">Alva Academy</h2><p className="mt-4 leading-7">Visítanos y vive una experiencia de barbería pensada para ti.</p><p className="mt-5 font-semibold">Dirección</p><p className="mt-1">Ubicación registrada en el mapa.</p><a className="booking-submit mt-6 inline-block" href="https://www.google.com/maps" target="_blank" rel="noreferrer">Abrir en Google Maps</a></div><div className="public-map"><iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d249.0443873421848!2d-78.99107859539716!3d-2.89959995115119!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sec!4v1793051178358!5m2!1ses!2sec" title="Ubicación de Alva Academy" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /></div></div></PublicPage>;
}
