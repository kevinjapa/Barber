// "use client";

// import Link from "next/link";
// import { useEffect, useState } from "react";
// import type { ReactNode } from "react";
// import { PublicHeader } from "./PublicHeader";
// import type { Service } from "./types";
// import { getPublicBarbers, getPublicServices } from "./publicDataCache";

// type Barber = { empid: number; name: string; last_name: string; photo_url?: string | null };

// function imageUrl(value?: string | null) {
//   return value ? (value.startsWith("http") ? value : `/uploads/${value.replace(/^\/?uploads\//, "")}`) : null;
// }

// export function ServicesDirectoryPage() {
//   const [services, setServices] = useState<Service[]>([]);
//   const [query, setQuery] = useState("");
//   const [minimum, setMinimum] = useState("");
//   const [maximum, setMaximum] = useState("");
//   useEffect(() => {
//     void getPublicServices().then(setServices);
//   }, []);
//   return (
//     <PublicPage title="Servicios pensados para ti" kicker="Nuestra carta">
//       <div className="service-filters">
//         <input aria-label="Buscar servicio" placeholder="Buscar por nombre..." value={query} onChange={(event) => setQuery(event.target.value)} />
//         <input aria-label="Precio mínimo" type="number" min="0" placeholder="Precio mínimo" value={minimum} onChange={(event) => setMinimum(event.target.value)} />
//         <input aria-label="Precio máximo" type="number" min="0" placeholder="Precio máximo" value={maximum} onChange={(event) => setMaximum(event.target.value)} />
//         <button type="button" onClick={() => { setQuery(""); setMinimum(""); setMaximum(""); }} className="action-secondary px-4 py-3 text-sm font-bold">Limpiar</button>
//       </div>
//       <div className="public-grid">
//         {services.filter((service) => {
//           const normalized = query.trim().toLowerCase();
//           const price = Number(service.price);
//           return (!normalized || service.name.toLowerCase().includes(normalized)) &&
//             (!minimum || price >= Number(minimum)) &&
//             (!maximum || price <= Number(maximum));
//         }).map((service) => (
//           <article className="public-card overflow-hidden" key={service.serviceid}>
//             <div className="public-card-media">{service.img_url ? <img src={imageUrl(service.img_url) ?? ""} alt="" /> : <span>{service.name[0]}</span>}</div>
//             <div className="p-6">
//               <div className="flex justify-between gap-4"><h2 className="font-serif text-2xl text-[#153e38]">{service.name}</h2><strong className="text-[#b97848]">${service.price.toFixed(2)}</strong></div>
//               <p className="mt-3 text-sm leading-6 text-[#718078]">{service.description || "Un servicio personalizado para renovar tu estilo."}</p>
//               <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#1d5b4f]">{service.duration} minutos</p>
//               <Link href={`/reservar?service=${service.serviceid}`} className="booking-submit mt-5 inline-block">Reservar</Link>
//             </div>
//           </article>
//         ))}
//       </div>
//     </PublicPage>
//   );
// }

// export function BarbersDirectoryPage() {
//   const [barbers, setBarbers] = useState<Barber[]>([]);
//   useEffect(() => {
//     void getPublicBarbers().then(setBarbers);
//   }, []);
//   return (
//     <PublicPage title="Conoce al equipo" kicker="Nuestro team">
//       <div className="public-grid sm:grid-cols-2 lg:grid-cols-4">
//         {barbers.map((barber) => (
//           <article className="public-card p-6" key={barber.empid}>
//             <div className="public-avatar">{imageUrl(barber.photo_url) ? <img src={imageUrl(barber.photo_url) ?? ""} alt="" /> : `${barber.name[0]}${barber.last_name[0]}`}</div>
//             <h2 className="mt-5 font-serif text-2xl text-[#153e38]">{barber.name} {barber.last_name}</h2>
//             <p className="mt-2 text-sm text-[#718078]">Barbero especialista</p>
//             <Link href={`/reservar?barber=${barber.empid}`} className="mt-5 inline-block text-sm font-bold text-[#1d5b4f]">Elegir barbero →</Link>
//           </article>
//         ))}
//       </div>
//     </PublicPage>
//   );
// }

// export function PublicPage({ title, kicker, children }: { title: string; kicker: string; children: ReactNode }) {
//   return (
//     <main className="booking-shell min-h-screen">
//       <div className="public-container">
//         <PublicHeader />
//         <section className="public-hero"><p className="booking-kicker">{kicker}</p><h1>{title}</h1></section>
//         {children}
//       </div>
//     </main>
//   );
// }


// ///////////////////////////////






// "use client";

// import Link from "next/link";
// import { useEffect, useState } from "react";
// import type { ReactNode } from "react";

// import { PublicHeader } from "./PublicHeader";
// import type { Service } from "./types";
// import {
//   getPublicBarbers,
//   getPublicServices,
// } from "./publicDataCache";

// type Barber = {
//   empid: number;
//   name: string;
//   last_name: string;
//   photo_url?: string | null;
// };

// function imageUrl(value?: string | null) {
//   if (!value) return null;

//   return value.startsWith("http")
//     ? value
//     : `/uploads/${value.replace(/^\/?uploads\//, "")}`;
// }

// /* =========================================
//    PÁGINA DE SERVICIOS
// ========================================= */

// export function ServicesDirectoryPage() {
//   const [services, setServices] = useState<Service[]>([]);
//   const [query, setQuery] = useState("");
//   const [minimum, setMinimum] = useState("");
//   const [maximum, setMaximum] = useState("");

//   useEffect(() => {
//     void getPublicServices().then(setServices);
//   }, []);

//   const filteredServices = services.filter((service) => {
//     const normalized = query.trim().toLowerCase();
//     const price = Number(service.price);

//     return (
//       (!normalized ||
//         service.name.toLowerCase().includes(normalized)) &&
//       (!minimum || price >= Number(minimum)) &&
//       (!maximum || price <= Number(maximum))
//     );
//   });

//   function clearFilters() {
//     setQuery("");
//     setMinimum("");
//     setMaximum("");
//   }

//   return (
//     <PublicPage
//       title="Encuentra tu próximo estilo"
//       kicker="SERVICIOS ALVA"
//     >
//       <div className="services-page">

//         {/* INTRODUCCIÓN */}
//         <section className="services-intro">
//           <div className="services-intro-heading">
//             <span className="services-eyebrow">
//               EXPERIENCIA ALVA BARBER
//             </span>

//             <h2>
//               Cada detalle
//               <br />
//               <span>define tu estilo.</span>
//             </h2>
//           </div>

//           <p>
//             Descubre nuestros servicios y encuentra el cuidado
//             que mejor se adapta a tu imagen. Calidad, dedicación
//             y atención en cada visita.
//           </p>
//         </section>

//         {/* FILTROS */}
//         <section className="services-toolbar">
//           <div className="services-search">
//             <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
//               <circle
//                 cx="11"
//                 cy="11"
//                 r="7"
//                 stroke="currentColor"
//                 strokeWidth="1.6"
//               />
//               <path
//                 d="m16 16 4 4"
//                 stroke="currentColor"
//                 strokeWidth="1.6"
//                 strokeLinecap="round"
//               />
//             </svg>

//             <input
//               aria-label="Buscar servicio"
//               placeholder="¿Qué servicio buscas?"
//               value={query}
//               onChange={(event) => setQuery(event.target.value)}
//             />
//           </div>

//           <div className="services-price-filters">
//             <input
//               aria-label="Precio mínimo"
//               type="number"
//               min="0"
//               placeholder="Desde $"
//               value={minimum}
//               onChange={(event) => setMinimum(event.target.value)}
//             />

//             <span className="services-filter-separator">—</span>

//             <input
//               aria-label="Precio máximo"
//               type="number"
//               min="0"
//               placeholder="Hasta $"
//               value={maximum}
//               onChange={(event) => setMaximum(event.target.value)}
//             />
//           </div>

//           <button
//             type="button"
//             className="services-clear"
//             onClick={clearFilters}
//           >
//             Limpiar filtros
//           </button>
//         </section>

//         {/* RESULTADOS */}
//         <div className="services-results">
//           <span>CATÁLOGO DE SERVICIOS</span>

//           <p>
//             {filteredServices.length}{" "}
//             {filteredServices.length === 1
//               ? "servicio disponible"
//               : "servicios disponibles"}
//           </p>
//         </div>

//         {/* LISTADO */}
//         {filteredServices.length > 0 ? (
//           <div className="services-grid">
//             {filteredServices.map((service, index) => {
//               const image = imageUrl(service.img_url);

//               return (
//                 <article
//                   className="service-card"
//                   key={service.serviceid}
//                 >
//                   {/* IMAGEN */}
//                   <div className="service-card-image">
//                     {image ? (
//                       <img
//                         src={image}
//                         alt={service.name}
//                         loading="lazy"
//                       />
//                     ) : (
//                       <div className="service-image-placeholder">
//                         <span>ALVA</span>
//                       </div>
//                     )}

//                     <span className="service-number">
//                       {String(index + 1).padStart(2, "0")}
//                     </span>

//                     <div className="service-image-overlay" />
//                   </div>

//                   {/* INFORMACIÓN */}
//                   <div className="service-card-content">
//                     <div className="service-card-heading">
//                       <h3>{service.name}</h3>

//                       <div className="service-price">
//                         <span>$</span>
//                         {Number(service.price).toFixed(2)}
//                       </div>
//                     </div>

//                     <p className="service-description">
//                       {service.description ||
//                         "Un servicio personalizado para renovar tu estilo y cuidar cada detalle."}
//                     </p>

//                     {/* DURACIÓN Y RESERVA */}
//                     <div className="service-card-footer">
//                       <div className="service-duration">
//                         <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
//                           <circle
//                             cx="12"
//                             cy="12"
//                             r="9"
//                             stroke="currentColor"
//                             strokeWidth="1.5"
//                           />
//                           <path
//                             d="M12 7v5l3 2"
//                             stroke="currentColor"
//                             strokeWidth="1.5"
//                             strokeLinecap="round"
//                           />
//                         </svg>

//                         <span>{service.duration} min</span>
//                       </div>

//                       <Link
//                         href={`/reservar?service=${service.serviceid}`}
//                         className="service-book-button"
//                       >
//                         Reservar
//                         <span>↗</span>
//                       </Link>
//                     </div>
//                   </div>
//                 </article>
//               );
//             })}
//           </div>
//         ) : (
//           <div className="services-empty">
//             <span>NO ENCONTRAMOS RESULTADOS</span>

//             <h3>No hay servicios con esos filtros.</h3>

//             <p>
//               Prueba con otro nombre o modifica el rango de precios.
//             </p>

//             <button
//               type="button"
//               onClick={clearFilters}
//             >
//               Ver todos los servicios
//             </button>
//           </div>
//         )}
//       </div>
//     </PublicPage>
//   );
// }




// /* =========================================
//    PÁGINA DE BARBEROS
// ========================================= */

// export function BarbersDirectoryPage() {
//   const [barbers, setBarbers] = useState<Barber[]>([]);

//   useEffect(() => {
//     void getPublicBarbers().then(setBarbers);
//   }, []);

//   return (
//     <PublicPage
//       title="Conoce al equipo"
//       kicker="NUESTRO TEAM"
//     >
//       <div className="public-grid sm:grid-cols-2 lg:grid-cols-4">
//         {barbers.map((barber) => {
//           const photo = imageUrl(barber.photo_url);

//           return (
//             <article
//               className="public-card p-6"
//               key={barber.empid}
//             >
//               <div className="public-avatar">
//                 {photo ? (
//                   <img
//                     src={photo}
//                     alt={`${barber.name} ${barber.last_name}`}
//                     loading="lazy"
//                   />
//                 ) : (
//                   `${barber.name[0]}${barber.last_name[0]}`
//                 )}
//               </div>

//               <h2 className="mt-5 font-serif text-2xl text-[#f2f2f2]">
//                 {barber.name} {barber.last_name}
//               </h2>

//               <p className="mt-2 text-sm text-[#a1a5ad]">
//                 Barbero especialista
//               </p>

//               <Link
//                 href={`/reservar?barber=${barber.empid}`}
//                 className="mt-5 inline-block text-sm font-bold text-[#b8c0c8]"
//               >
//                 Elegir barbero →
//               </Link>
//             </article>
//           );
//         })}
//       </div>
//     </PublicPage>
//   );
// }

// /* =========================================
//    CONTENEDOR DE PÁGINAS PÚBLICAS
// ========================================= */

// export function PublicPage({
//   title,
//   kicker,
//   children,
// }: {
//   title: string;
//   kicker: string;
//   children: ReactNode;
// }) {
//   return (
//     <main className="booking-shell min-h-screen">
//       <div className="public-container">
//         <PublicHeader />

//         <section className="public-hero">
//           <p className="booking-kicker">{kicker}</p>
//           <h1>{title}</h1>
//         </section>

//         {children}
//       </div>
//     </main>
//   );
// }

















"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { PublicHeader } from "./PublicHeader";
import type { Service } from "./types";
import { getPublicBarbers, getPublicServices } from "./publicDataCache";

type Barber = {
  empid: number;
  name: string;
  last_name: string;
  photo_url?: string | null;
};

function imageUrl(value?: string | null): string | null {
  if (!value) return null;

  return value.startsWith("http")
    ? value
    : `/uploads/${value.replace(/^\/?uploads\//, "")}`;
}

/* =====================================================
   PÁGINA DE SERVICIOS
===================================================== */

export function ServicesDirectoryPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [query, setQuery] = useState("");
  const [minimum, setMinimum] = useState("");
  const [maximum, setMaximum] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getPublicServices()
      .then((data) => {
        if (active) setServices(data);
      })
      .catch((error) => {
        console.error("No se pudieron cargar los servicios:", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredServices = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return services.filter((service) => {
      const name = service.name?.toLowerCase() ?? "";
      const price = Number(service.price ?? 0);

      const matchesName = !normalized || name.includes(normalized);
      const matchesMinimum =
        minimum === "" || price >= Number(minimum);
      const matchesMaximum =
        maximum === "" || price <= Number(maximum);

      return matchesName && matchesMinimum && matchesMaximum;
    });
  }, [services, query, minimum, maximum]);

  function clearFilters() {
    setQuery("");
    setMinimum("");
    setMaximum("");
  }

  // return (
  //   <PublicPage
  //     title="Encuentra tu próximo estilo"
  //     kicker="Nuestros Servicios"
  //   >
  return (
  <PublicPage
    title="Encuentra tu próximo estilo"
    kicker="Nuestros Servicios"
    hideHero
  >
    <div className="services-page"></div>
      <div className="services-page">
        <section className="services-intro">
          <div className="services-intro-copy">
            <span className="services-eyebrow">
              NUESTRA CARTA
            </span>
            <h2>
              Cada detalle
              <br />
              <em>define tu estilo.</em>
            </h2>
          </div>

          <div className="services-intro-description">
            <span className="services-intro-line" />

            <p>
              Descubre nuestros servicios y encuentra el cuidado
              que mejor se adapta a tu imagen. Calidad, dedicación
              y atención en cada visita.
            </p>
          </div>
        </section>

        {/* FILTROS */}

        <section className="services-toolbar" aria-label="Filtros de servicios">
          <div className="services-search">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 4.5 4.5" />
            </svg>

            <input
              type="search"
              aria-label="Buscar servicio"
              placeholder="¿Qué servicio buscas?"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="services-price-filters">
            <label>
              <span>Desde $</span>
              <input
                type="number"
                min="0"
                placeholder="Mínimo"
                aria-label="Precio mínimo"
                value={minimum}
                onChange={(event) => setMinimum(event.target.value)}
              />
            </label>

            <label>
              <span>Hasta $</span>
              <input
                type="number"
                min="0"
                placeholder="Máximo"
                aria-label="Precio máximo"
                value={maximum}
                onChange={(event) => setMaximum(event.target.value)}
              />
            </label>
          </div>

          <button
            type="button"
            className="services-clear-button"
            onClick={clearFilters}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path d="M20 7v5h-5" />
              <path d="M4.8 9a7.5 7.5 0 0 1 13-2L20 12" />
              <path d="M4 17v-5h5" />
              <path d="M19.2 15a7.5 7.5 0 0 1-13 2L4 12" />
            </svg>
            Limpiar filtros
          </button>
        </section>

        {/* CATÁLOGO */}

        <section className="services-catalog">
          <div className="services-catalog-heading">
            <div>
              <span className="services-eyebrow">
                CATÁLOGO DE SERVICIOS
              </span>
              <span className="services-heading-line" />
            </div>

            <span className="services-count">
              {filteredServices.length}{" "}
              {filteredServices.length === 1
                ? "servicio disponible"
                : "servicios disponibles"}
            </span>
          </div>

          {loading ? (
            <div className="services-feedback">
              <span className="services-loader" />
              <p>Cargando servicios...</p>
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="services-grid">
              {filteredServices.map((service, index) => {
                const image = imageUrl(service.img_url);
                const price = Number(service.price ?? 0);

                return (
                  <article
                    className="services-card"
                    key={service.serviceid}
                  >
                    

                    <div className="services-card-image">
                      {image ? (
                        <img
                          src={image}
                          alt={`Servicio ${service.name}`}
                          loading="lazy"
                        />
                      ) : (
                        <div className="services-image-placeholder">
                          <span>
                            {service.name?.charAt(0).toUpperCase() || "A"}
                          </span>
                        </div>
                      )}

                      <div className="services-image-overlay" />
                    </div>

                    

                    <div className="services-card-content">
                      <span className="services-card-number">
                        {String(index + 1).padStart(2, "0")} /{" "}
                        {String(filteredServices.length).padStart(2, "0")}
                      </span>

                      <div className="services-card-main">
                        <h3>{service.name}</h3>

                        <p className="services-card-description">
                          {service.description ||
                            "Un servicio personalizado para renovar tu estilo."}
                        </p>
                      </div>

                      <div className="services-card-footer">
                        <div className="services-card-meta">
                          <span className="services-duration">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden="true"
                            >
                              <circle cx="12" cy="12" r="9" />
                              <path d="M12 7v5l3 2" />
                            </svg>

                            {service.duration} min
                          </span>

                          <span className="services-meta-divider" />

                          <strong className="services-price">
                            ${price.toFixed(2)}
                          </strong>
                        </div>

                        <Link
                          href={`/reservar?service=${service.serviceid}`}
                          className="services-book-button"
                        >
                          Reservar
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="services-empty">
              <span className="services-empty-mark">—</span>

              <h3>No encontramos servicios</h3>

              <p>
                Prueba con otro nombre o modifica los filtros de precio.
              </p>

              <button type="button" onClick={clearFilters}>
                Ver todos los servicios
              </button>
            </div>
          )}
        </section>
      </div>
    </PublicPage>
  );
}

/* =====================================================
   PÁGINA DE BARBEROS
===================================================== */

export function BarbersDirectoryPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);

  useEffect(() => {
    void getPublicBarbers()
      .then(setBarbers)
      .catch((error) => {
        console.error("No se pudieron cargar los barberos:", error);
      });
  }, []);

  return (
    <PublicPage title="Conoce al equipo" kicker="NUESTRO TEAM">
      <div className="public-grid sm:grid-cols-2 lg:grid-cols-4">
        {barbers.map((barber) => {
          const photo = imageUrl(barber.photo_url);

          return (
            <article className="public-card p-6" key={barber.empid}>
              <div className="public-avatar">
                {photo ? (
                  <img
                    src={photo}
                    alt={`${barber.name} ${barber.last_name}`}
                  />
                ) : (
                  `${barber.name[0]}${barber.last_name[0]}`
                )}
              </div>

              <h2 className="mt-5 font-serif text-2xl">
                {barber.name} {barber.last_name}
              </h2>

              <p className="mt-2 text-sm text-[var(--ink-soft)]">
                Barbero especialista
              </p>

              <Link
                href={`/reservar?barber=${barber.empid}`}
                className="mt-5 inline-block text-sm font-bold text-[var(--accent)]"
              >
                Elegir barbero →
              </Link>
            </article>
          );
        })}
      </div>
    </PublicPage>
  );
}

/* =====================================================
   ESTRUCTURA GENERAL DE PÁGINAS PÚBLICAS
===================================================== */

export function PublicPage({
  title,
  kicker,
  children,
  hideHero = false,
}: {
  title: string;
  kicker: string;
  children: ReactNode;
  hideHero?: boolean;
}) {
  return (
    <main className="booking-shell min-h-screen">
      <div className="public-container">
        <PublicHeader />

        {!hideHero && (
          <section className="public-hero">
            <p className="booking-kicker">{kicker}</p>
            <h1>{title}</h1>
          </section>
        )}

        {children}
      </div>
    </main>
  );
}
