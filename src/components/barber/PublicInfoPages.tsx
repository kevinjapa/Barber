// import { PublicPage } from "./PublicDirectoryPage";

// export function AboutPage() {
//   return <PublicPage kicker="Alva Academy" title="Una experiencia hecha para que vuelvas"><div className="public-copy"><p>Creemos que una visita a la barbería es más que un corte: es tiempo para ti, conversación y confianza.</p><p>Trabajamos con productos seleccionados, técnicas actuales y un equipo que cuida cada detalle.</p></div></PublicPage>;
// }

// export function WorksPage() {
//   return <PublicPage kicker="Portafolio" title="Trabajos que hablan por sí solos"><div className="public-grid sm:grid-cols-2 lg:grid-cols-3">{["Cortes clásicos", "Barba definida", "Estilo contemporáneo"].map((work) => <article className="public-card public-work" key={work}><div className="public-work-placeholder">Alva</div><div className="p-5"><h2 className="font-serif text-2xl text-[#153e38]">{work}</h2><p className="mt-2 text-sm text-[#718078]">Diseñado para tu estilo y tu rutina.</p></div></article>)}</div></PublicPage>;
// }

// export function LocationPage() {
//   return <PublicPage kicker="Encuéntranos" title="Tu próxima visita empieza aquí"><div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><div className="public-card p-7"><h2 className="font-serif text-3xl">Alva Academy</h2><p className="mt-4 leading-7">Visítanos y vive una experiencia de barbería pensada para ti.</p><p className="mt-5 font-semibold">Dirección</p><p className="mt-1">Ubicación registrada en el mapa.</p><a className="booking-submit mt-6 inline-block" href="https://www.google.com/maps" target="_blank" rel="noreferrer">Abrir en Google Maps</a></div><div className="public-map"><iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d249.0443873421848!2d-78.99107859539716!3d-2.89959995115119!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sec!4v1793051178358!5m2!1ses!2sec" title="Ubicación de Alva Academy" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /></div></div></PublicPage>;
// }




// import { PublicPage } from "./PublicDirectoryPage";

// export function AboutPage() {
//   const phone = "593XXXXXXXXX";
//   const email = "contacto@tudominio.com";

//   return (
//     <PublicPage
//       kicker="Conócenos"
//       title="Más que una barbería, un espacio para ti"
//     >
//       <div className="public-copy">
//         <p>
//           En Alva Barber creemos que cada persona tiene un estilo
//           propio. Por eso, buscamos que cada visita sea una
//           experiencia de cuidado, confianza y atención personalizada.
//         </p>

//         <p>
//           Nuestro propósito es ofrecer un espacio donde puedas
//           desconectarte de la rutina, disfrutar de un buen servicio
//           y salir sintiéndote bien con tu imagen.
//         </p>
//       </div>

//       <section className="public-card p-7 mt-10">
//         <h2 className="font-serif text-3xl">
//           Nuestra filosofía
//         </h2>

//         <div className="public-grid sm:grid-cols-2 mt-6">
//           <div>
//             <h3 className="font-semibold">Atención personalizada</h3>
//             <p>Nos interesa conocer tu estilo y lo que buscas.</p>
//           </div>

//           <div>
//             <h3 className="font-semibold">Cuidado en cada detalle</h3>
//             <p>Trabajamos para ofrecer una experiencia agradable.</p>
//           </div>

//           <div>
//             <h3 className="font-semibold">Estilo y confianza</h3>
//             <p>Queremos que te sientas cómodo con tu imagen.</p>
//           </div>

//           <div>
//             <h3 className="font-semibold">Compromiso</h3>
//             <p>Cada visita merece nuestra atención.</p>
//           </div>
//         </div>
//       </section>

//       <section className="public-card p-7 mt-10">
//         <h2 className="font-serif text-3xl">
//           Hablemos de tu próximo estilo
//         </h2>

//         <p className="mt-3">
//           ¿Tienes alguna consulta o deseas conocer nuestros servicios?
//           Estamos disponibles para ayudarte.
//         </p>

//         <div className="mt-6 space-y-4">
//           <p>
//             <strong>Teléfono:</strong>{" "}
//             <a href={`tel:+${phone}`}>+{phone}</a>
//           </p>

//           <p>
//             <strong>Correo:</strong>{" "}
//             <a href={`mailto:${email}`}>{email}</a>
//           </p>

//           <p>
//             <strong>Dirección:</strong> Tu dirección aquí
//           </p>

//           <p>
//             <strong>Horario:</strong> Tus horarios de atención
//           </p>
//         </div>

//         <a
//           href={`https://wa.me/${phone}?text=Hola,%20quisiera%20información%20sobre%20sus%20servicios.`}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="booking-submit mt-7 inline-block"
//         >
//           Contactar por WhatsApp
//         </a>
//       </section>
//     </PublicPage>
//   );
// }




import { PublicPage } from "./PublicDirectoryPage";

const BUSINESS_PHONE = "5930939615889";
const BUSINESS_EMAIL = "contacto@tudominio.com";
const BUSINESS_ADDRESS = "Escribe aquí la dirección de Alva Barber";

const WHATSAPP_URL = `https://wa.me/${BUSINESS_PHONE}?text=${encodeURIComponent(
  "Hola, quisiera obtener información sobre tus servicios y disponibilidad de las citas"
)}`;

const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d333.20318874315564!2d-78.99090741812189!3d-2.8997103586443544!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sec!4v1795057074917!5m2!1ses!2sec";

const MAP_DIRECTIONS_URL =
  "https://www.google.com/maps/search/?api=1&query=-2.8997103586443544%2C-78.99090741812189";

const BUSINESS_HOURS = [
  { day: "Martes", hours: "08:00 - 20:00" },
  { day: "Miércoles", hours: "08:00 - 20:00" },
  { day: "Jueves", hours: "08:00 - 20:00" },
  { day: "Viernes", hours: "08:00 - 20:00" },
  { day: "Sábado", hours: "08:00 - 20:00" },
  { day: "Domingo", hours: "08:00 - 20:00" },
];

/* =========================================
   PÁGINA NOSOTROS
========================================= */

export function AboutPage() {
  return (
    <PublicPage
      kicker="CONÓCENOS"
      title="Más que una barbería, un espacio para ti"
    >
      <div className="about-page">

        {/* INTRODUCCIÓN */}

        <section className="about-intro">
          <div className="about-intro-content">
            <span className="about-eyebrow">
              NUESTRA ESENCIA
            </span>

            <h2>El estilo está en los detalles.</h2>

            <p>
              En Alva Barber creemos que cada persona tiene
              un estilo propio. Buscamos que cada visita sea
              una experiencia de cuidado, confianza y atención
              personalizada.
            </p>
          </div>

          <div className="about-intro-image">
            <img
              src="/assets/localAlva.png"
              alt="Interior de Alva Barber"
            />
          </div>
        </section>

        {/* FILOSOFÍA */}

        <section className="about-philosophy">
          <div className="about-section-heading">
            <span className="about-eyebrow">
              LO QUE NOS DEFINE
            </span>

            <h2>Nuestra filosofía</h2>

            <p>
              Nos importa tanto el resultado como la experiencia
              que vives durante cada visita.
            </p>
          </div>

          <div className="about-values">

            <article className="about-value">
              <span className="about-value-number">01</span>

              <h3>Atención personalizada</h3>

              <p>
                Conocemos tus preferencias para encontrar el
                estilo que mejor te representa.
              </p>
            </article>

            <article className="about-value">
              <span className="about-value-number">02</span>

              <h3>Cuidado en cada detalle</h3>

              <p>
                Prestamos atención a cada parte del servicio,
                desde el inicio hasta el resultado final.
              </p>
            </article>

            <article className="about-value">
              <span className="about-value-number">03</span>

              <h3>Estilo y confianza</h3>

              <p>
                Queremos que disfrutes el proceso y te sientas
                bien con tu imagen.
              </p>
            </article>

            <article className="about-value">
              <span className="about-value-number">04</span>

              <h3>Compromiso</h3>

              <p>
                Cada cliente merece un servicio realizado
                con dedicación.
              </p>
            </article>

          </div>
        </section>

        {/* MAPA GOOGLE MAPS */}
        <section className="location-map-container">

          <div className="location-map-heading">
            <div>
              <span>UBICACIÓN</span>
              <h3>Cómo Encontrarnos</h3>
            </div>

            <span className="location-map-status">
              Google Maps
            </span>
          </div>

          <div className="location-map">
            <iframe
              src={MAP_EMBED_URL}
              title="Ubicación de Alva Barber en Google Maps"
              loading="eager"
              width="100%"
              height="450"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              style={{
                border: 0,
                width: "100%",
                height: "450px",
                display: "block",
              }}
            />
          </div>

          <a
            href={MAP_DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="location-directions"
          >
            <span>Ver ubicación y obtener indicaciones</span>
            <span>↗</span>
          </a>

        </section>

        <section className="about-contact">

          <div className="about-contact-content">
            <span className="about-eyebrow">
              ESTAMOS PARA TI
            </span>

            <h2>Tu próximo estilo comienza aquí.</h2>

            <p>
              ¿Tienes alguna consulta o deseas conocer nuestros
              servicios? Nos encantará atenderte.
            </p>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="about-contact-button"
            >
              Contactar por WhatsApp
              <span>↗</span>
            </a>
          </div>

          <div className="about-contact-details">

            <div>
              <span>01 / TELÉFONO</span>
              <a href={`tel:+${BUSINESS_PHONE}`}>
                +{BUSINESS_PHONE}
              </a>
            </div>

            <div>
              <span>02 / CORREO</span>
              <a href={`mailto:${BUSINESS_EMAIL}`}>
                {BUSINESS_EMAIL}
              </a>
            </div>

            <div>
              <span>03 / DIRECCIÓN</span>
              <p>{BUSINESS_ADDRESS}</p>
            </div>

            <div>
              <span>04 / HORARIO</span>

              <div className="about-business-hours">
                {BUSINESS_HOURS.map((item) => (
                  <p key={item.day}>
                    <strong>{item.day}:</strong> {item.hours}
                  </p>
                ))}
              </div>
            </div>

          </div>

        </section>

      </div>
    </PublicPage>
  );
}
