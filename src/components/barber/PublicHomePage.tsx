// "use client";

// import Link from "next/link";
// import { useEffect, useState } from "react";
// import type { CSSProperties } from "react";
// import type { Product, Service } from "./types";
// import { PublicHeader } from "./PublicHeader";
// import { getPublicBarbers, getPublicProducts, getPublicServices } from "./publicDataCache";

// type Barber = { empid: number; name: string; last_name: string; photo_url?: string | null };

// function mediaUrl(value?: string | null) {
//   return value ? (value.startsWith("http") ? value : `/uploads/${value.replace(/^\/?uploads\//, "")}`) : null;
// }

// export function PublicHomePage() {
//   const [services, setServices] = useState<Service[]>([]);
//   const [products, setProducts] = useState<Product[]>([]);
//   const [barbers, setBarbers] = useState<Barber[]>([]);

//   useEffect(() => {
//     void Promise.all([
//       getPublicServices(),
//       getPublicProducts(),
//       getPublicBarbers(),
//     ]).then(([loadedServices, loadedProducts, loadedBarbers]) => {
//       setServices(loadedServices);
//       setProducts(loadedProducts);
//       setBarbers(loadedBarbers);
//     });
//   }, []);

//   const featuredServices = services.slice(0, 4);

//   return (
//     <main className="public-home">
//       <div className="public-container">
//         <PublicHeader />
//         <section className="home-hero">
//           <div className="home-hero-copy">
//             <p className="booking-kicker">Barbería contemporánea</p>
//             <h1>Tu estilo. Nuestra precisión.</h1>
//             <p>Un espacio para desconectar, cuidar tu imagen y salir con un estilo que se siente propio.</p>
//             <div className="flex flex-wrap gap-3">
//               <Link href="/reservar" className="booking-submit">Reservar una cita</Link>
//               <Link href="/servicios" className="action-secondary px-5 py-3 text-sm font-bold">Explorar servicios</Link>
//             </div>
//           </div>
//           <div className="home-hero-visual" aria-label="Detalle visual de Alva Academy">
//             <img src="assets/alvaberber_icon.png" alt="" className="home-hero-image" />
//             <div className="home-hero-overlay" />
//             <div className="home-hero-caption">
//               <span>ALVA ACADEMY</span>
//               <strong>Precisión que se nota.</strong>
//             </div>
//           </div>
//         </section>

//         <section className="home-value-strip" aria-label="La experiencia Alva">
//           <div><strong>01</strong><span>Servicios pensados para tu estilo</span></div>
//           <div><strong>02</strong><span>Profesionales que cuidan cada detalle</span></div>
//           <div><strong>03</strong><span>Reserva tu espacio en pocos pasos</span></div>
//         </section>

//         <section className="home-intro">
//           <div>
//             <p className="booking-kicker">La experiencia Alva</p>
//             <h2>Más que un corte, un momento para ti.</h2>
//           </div>
//           <p>Trabajamos con atención personalizada, criterio y productos profesionales para que cada visita tenga el resultado que esperas.</p>
//         </section>

//         <section className="home-section" id="servicios">
//           <div className="home-section-heading"><div><p className="booking-kicker">Nuestros servicios</p><h2>Hecho a tu medida.</h2></div><Link href="/servicios" className="home-link">Ver todos los servicios →</Link></div>
//           <div className={`home-service-marquee ${featuredServices.length < 2 ? "home-service-marquee-static" : ""}`}>
//             <div className="home-service-track">
//               {(featuredServices.length < 2 ? featuredServices : [...featuredServices, ...featuredServices]).map((service, index) => <Link aria-label={`Reservar ${service.name}`} href={`/reservar?service=${service.serviceid}`} className={`home-service-card home-service-card-${index % 4 + 1}`} key={`${service.serviceid}-${index}`}><span className="home-card-number">0{index % featuredServices.length + 1}</span><div><h3>{service.name}</h3><p>{service.description || "Servicio personalizado para renovar tu estilo."}</p><strong>${service.price.toFixed(2)} · {service.duration} min</strong></div><span className="home-card-arrow" aria-hidden="true">↗</span></Link>)}
//             </div>
//           </div>
//           {services.length === 0 && <p className="home-empty">Los servicios estarán disponibles próximamente.</p>}
//         </section>

//         <section className="home-section home-products">
//           <div className="home-section-heading"><div><p className="booking-kicker">Cuidado masculino</p><h2>Productos que continúan la experiencia.</h2></div><Link href="/productos" className="home-link">Ver catálogo →</Link></div>
//           <div className="home-product-grid">
//             {products.slice(0, 4).map((product, index) => <article className="home-product-card" key={product.productid} style={{ "--card-delay": `${index * 90}ms` } as CSSProperties}><div className="home-product-media">{mediaUrl(product.img_url) ? <img src={mediaUrl(product.img_url) ?? ""} alt="" /> : <span>{product.name[0]}</span>}</div><div><h3>{product.name}</h3><p>{product.description || "Producto seleccionado para tu rutina."}</p><strong>${product.price.toFixed(2)}</strong><Link href="/productos" className="home-product-link">Conocer producto <span aria-hidden="true">↗</span></Link></div></article>)}
//           </div>
//           {products.length === 0 && <p className="home-empty">El catálogo de productos estará disponible próximamente.</p>}
//         </section>

//         <section className="home-team">
//           <div className="home-team-copy"><p className="booking-kicker">Nuestro team</p><h2>Personas que entienden tu estilo.</h2><p>Conoce a nuestro equipo y elige con quién quieres vivir tu próxima experiencia.</p><Link href="/barberos" className="booking-submit inline-block">Conocer al equipo</Link></div>
//           <div className="home-team-list">{barbers.slice(0, 3).map((barber) => <Link href={`/reservar?barber=${barber.empid}`} className="home-team-item" key={barber.empid}><div className="public-avatar">{mediaUrl(barber.photo_url) ? <img src={mediaUrl(barber.photo_url) ?? ""} alt="" /> : `${barber.name[0]}${barber.last_name[0]}`}</div><div><h3>{barber.name} {barber.last_name}</h3><p>Barbero especialista</p></div><span>↗</span></Link>)}</div>
//         </section>

//         <section className="home-location"><div><p className="booking-kicker">Visítanos</p><h2>Tu próxima visita empieza aquí.</h2><p>Encuentra el local, conoce nuestra ubicación y reserva tu espacio.</p><Link href="/ubicacion" className="home-link">Ver ubicación y contacto →</Link></div><div className="home-location-mark">ALVA<span>BARBER</span></div></section>
//         <footer className="public-footer"><span>© {new Date().getFullYear()} Alva Academy</span><div><Link href="/">Home</Link><Link href="/nosotros">Nosotros</Link><Link href="/privacidad">Privacidad</Link><Link href="/acceso">Mi cuenta</Link></div></footer>
//       </div>
//     </main>
//   );
// }

//  -----------------------------------------------------------------

"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { Product, Service } from "./types";
import { PublicHeader } from "./PublicHeader";
import {
  getPublicBarbers,
  getPublicProducts,
  getPublicServices,
} from "./publicDataCache";

type Barber = {
  empid: number;
  name: string;
  last_name: string;
  photo_url?: string | null;
};

function mediaUrl(value?: string | null) {
  if (!value) return null;
  return value.startsWith("http")
    ? value
    : `/uploads/${value.replace(/^\/?uploads\//, "")}`;
}

export function PublicHomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all([
      getPublicServices(),
      getPublicProducts(),
      getPublicBarbers(),
    ])
      .then(([s, p, b]) => {
        if (!active) return;
        setServices(s);
        setProducts(p);
        setBarbers(b);
      })
      .catch((error) => {
        console.error("Error cargando la página pública:", error);
      })
      .finally(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const featuredServices = services.slice(0, 4);
  const featuredProducts = products.slice(0, 4);
  const featuredBarbers = barbers.slice(0, 3);

  return (
    <main className="public-home alva-home">
      <div className="public-container alva-container">
        <PublicHeader />

        {/* HERO */}
        <section className="alva-hero">
          <div className="alva-hero-copy">
            <div className="alva-eyebrow">
              <span className="alva-status-dot" />
              BARBERÍA
            </div>

            <h1>
              El estilo
              <br />
              no se improvisa<span>.</span>
            </h1>

            <p className="alva-hero-description">
              Precisión en cada corte. Atención en cada detalle.
              Un espacio diseñado para llevar tu estilo al siguiente nivel.
            </p>

            <div className="alva-hero-actions">
              <Link href="/reservar" className="alva-button-primary">
                Reservar una cita <span aria-hidden="true">↗</span>
              </Link>

              <Link href="/servicios" className="alva-button-secondary">
                Explorar servicios
              </Link>
            </div>

            <div className="alva-hero-meta">
              <span>01 / ESTILO</span>
              <span>02 / PRECISIÓN</span>
              <span>03 / EXPERIENCIA</span>
            </div>
          </div>

          <div className="alva-hero-visual">
            <div className="alva-hero-photo">
              <Image
                src="/assets/pexels-barber-experience-32847602.jpg"
                alt="Barbero atendiendo a un cliente en una barbería tradicional; fotografía referencial."
                className="alva-hero-image"
                fill
                sizes="(max-width: 700px) 100vw, 46vw"
                preload
              />
            </div>

            <div className="alva-hero-image-shade" />

            <div className="alva-hero-index">
              <span>ALVA</span>
              <span>FOTOGRAFÍA REFERENCIAL · PEXELS</span>
            </div>

            <div className="alva-hero-note">
              <span>EL DETALLE LO CAMBIA TODO</span>
              <strong>Tu imagen, tu identidad.</strong>
            </div>

          </div>

          <div className="alva-hero-scroll">
            {/* <span /> */}
            DESLIZA PARA DESCUBRIR
          </div>
        </section>

        {/* VALUE STRIP */}
        <section className="alva-value-strip">
          <div>
            <span className="alva-micro-number">01</span>
            <div>
              <strong>Tu estilo</strong>
              <p>Atención personalizada</p>
            </div>
          </div>

          <div>
            <span className="alva-micro-number">02</span>
            <div>
              <strong>Cada detalle</strong>
              <p>Precisión y cuidado</p>
            </div>
          </div>

          <div>
            <span className="alva-micro-number">03</span>
            <div>
              <strong>Tu momento</strong>
              <p>Reserva en pocos pasos</p>
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section className="alva-intro">
          <div className="alva-section-index">
            <span>01</span>
            <span>LA EXPERIENCIA ALVA</span>
          </div>

          <div className="alva-intro-content">
            <h2>
              No es solamente
              <br />
              un corte<span>.</span>
            </h2>

            <div className="alva-intro-aside">
              <span className="alva-aside-line" />
              <p>
                Es tomarte un momento, cuidar tu imagen y salir
                con un estilo que realmente te represente.
              </p>
              <Link href="/nosotros" className="alva-text-link">
                Conoce nuestra filosofía <span>↗</span>
              </Link>
            </div>
          </div>
        </section>

        {/* REFERENCE PHOTOS */}
        <section
          className="alva-reference-gallery"
          aria-label="Fotografías referenciales de barbería"
        >
          <figure className="alva-reference-card">
            <Image
              src="/assets/pexels-barber-service-36105790.jpg"
              alt="Barbero trabajando junto a su cliente; fotografía referencial."
              className="alva-reference-image"
              fill
              sizes="(max-width: 700px) 100vw, (max-width: 1024px) 50vw, 42vw"
            />
            <span className="alva-reference-tag">IMAGEN REFERENCIAL · PEXELS</span>
            <figcaption>
              <span>EL OFICIO</span>
              <strong>Atención en cada detalle</strong>
            </figcaption>
          </figure>

          <figure className="alva-reference-card">
            <Image
              src="/assets/pexels-barbershop-interior-37764947.jpg"
              alt="Interior clásico de barbería con sillones de barbero; fotografía referencial."
              className="alva-reference-image"
              fill
              sizes="(max-width: 700px) 100vw, (max-width: 1024px) 50vw, 42vw"
            />
            <span className="alva-reference-tag">IMAGEN REFERENCIAL · PEXELS</span>
            <figcaption>
              <span>EL AMBIENTE</span>
              <strong>Un espacio para el ritual</strong>
            </figcaption>
          </figure>
        </section>

        {/* SERVICES */}
        <section className="alva-section" id="servicios">
          <div className="alva-section-header">
            <div>
              <div className="alva-section-index">
                <span>02</span>
                <span>SERVICIOS</span>
              </div>
              <h2>
                Encuentra tu
                <br />
                próximo estilo<span>.</span>
              </h2>
            </div>

            <Link href="/servicios" className="alva-text-link">
              Todos los servicios <span>↗</span>
            </Link>
          </div>

          {!loaded ? (
            <div className="alva-loading">Cargando servicios...</div>
          ) : featuredServices.length > 0 ? (
            <div className="alva-service-grid">
              {featuredServices.map((service, index) => (
                <Link
                  href={`/reservar?service=${service.serviceid}`}
                  className="alva-service-card"
                  key={service.serviceid}
                  style={
                    { "--item-index": index } as CSSProperties
                  }
                >
                  <div className="alva-service-top">
                    <span>0{index + 1}</span>
                    <span className="alva-service-arrow">↗</span>
                  </div>

                  <div className="alva-service-content">
                    <h3>{service.name}</h3>
                    <p>
                      {service.description ||
                        "Un servicio pensado para cuidar cada detalle de tu estilo."}
                    </p>
                  </div>

                  <div className="alva-service-bottom">
                    <strong>${Number(service.price).toFixed(2)}</strong>
                    <span>{service.duration} MIN</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="alva-empty">
              Los servicios estarán disponibles próximamente.
            </p>
          )}
        </section>

        {/* PRODUCTS */}
        <section className="alva-section alva-products" id="productos">
          <div className="alva-section-header">
            <div>
              <div className="alva-section-index">
                <span>03</span>
                <span>CUIDADO PERSONAL</span>
              </div>
              <h2>
                El estilo continúa
                <br />
                fuera de la barbería<span>.</span>
              </h2>
            </div>

            <Link href="/productos" className="alva-text-link">
              Explorar catálogo <span>↗</span>
            </Link>
          </div>

          {!loaded ? (
            <div className="alva-loading">Cargando productos...</div>
          ) : featuredProducts.length > 0 ? (
            <div className="alva-product-grid">
              {featuredProducts.map((product, index) => (
                <article
                  className="alva-product-card"
                  key={product.productid}
                  style={
                    { "--item-index": index } as CSSProperties
                  }
                >
                  <Link
                    href="/productos"
                    className="alva-product-media"
                    aria-label={`Conocer ${product.name}`}
                  >
                    <span className="alva-product-number">
                      PRODUCTO / 0{index + 1}
                    </span>

                    {mediaUrl(product.img_url) ? (
                      <img
                        src={mediaUrl(product.img_url)!}
                        alt={product.name}
                        loading="lazy"
                      />
                    ) : (
                      <span className="alva-product-placeholder">
                        {product.name.charAt(0).toUpperCase()}
                      </span>
                    )}

                    <span className="alva-product-open">↗</span>
                  </Link>

                  <div className="alva-product-info">
                    <div>
                      <h3>{product.name}</h3>
                      <p>
                        {product.description ||
                          "Un complemento para tu rutina personal."}
                      </p>
                    </div>
                    <strong>${Number(product.price).toFixed(2)}</strong>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="alva-empty">
              El catálogo estará disponible próximamente.
            </p>
          )}
        </section>

        {/* TEAM */}
        <section className="alva-team" id="barberos">
          <div className="alva-team-intro">
            <div className="alva-section-index">
              <span>04</span>
              <span>NUESTRO EQUIPO</span>
            </div>

            <h2>
              Buenas manos.
              <br />
              Mejor resultado<span>.</span>
            </h2>

            <p>
              Conoce a nuestro equipo y encuentra al profesional
              con quien quieres realizar tu próxima reserva.
            </p>

            <Link href="/barberos" className="alva-button-primary">
              Conocer al equipo <span>↗</span>
            </Link>
          </div>

          <div className="alva-team-list">
            {!loaded ? (
              <p className="alva-loading">Cargando equipo...</p>
            ) : featuredBarbers.length > 0 ? (
              featuredBarbers.map((barber, index) => (
                <Link
                  href={`/reservar?barber=${barber.empid}`}
                  className="alva-team-member"
                  key={barber.empid}
                >
                  <span className="alva-team-number">0{index + 1}</span>

                  <div className="alva-team-avatar">
                    {mediaUrl(barber.photo_url) ? (
                      <img
                        src={mediaUrl(barber.photo_url)!}
                        alt={`${barber.name} ${barber.last_name}`}
                        loading="lazy"
                      />
                    ) : (
                      <span>
                        {barber.name.charAt(0)}
                        {barber.last_name.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div className="alva-team-name">
                    <h3>
                      {barber.name} {barber.last_name}
                    </h3>
                    <p>Especialista en barbería</p>
                  </div>

                  <span className="alva-team-arrow">↗</span>
                </Link>
              ))
            ) : (
              <p className="alva-empty">
                Nuestro equipo estará disponible próximamente.
              </p>
            )}
          </div>
        </section>

        {/* FINAL CTA
        <section className="alva-final-cta">
          <div className="alva-final-grid" aria-hidden="true" />

          <div className="alva-section-index">
            <span>05</span>
            <span>ES TU MOMENTO</span>
          </div>
          <div className="TargetPresentation">
            <img
            src="assets/TargetPresentation.jpg"
            alt="Targeta de presentación de Alva Barber, con el logo y la dirección de contacto; fotografía referencial."
            loading="lazy"
            />
          </div>
          <h2>
            Tu próximo
            <br />
            estilo empieza aquí<span>.</span>
          </h2>
          <p>
            Elige tu servicio, encuentra tu horario y deja
            que el resto comience con una reserva.
          </p>
          <Link href="/reservar" className="alva-button-primary">
            Reservar mi cita <span>↗</span>
          </Link>
        </section> */}

        <section className="alva-final-cta">
          <div className="alva-final-grid" aria-hidden="true" />

          <div className="alva-section-index">
            <span>05</span>
            <span>ES TU MOMENTO</span>
          </div>

          <div className="TargetPresentation">
            <img
              src="assets/TargetPresentation.jpg"
              alt="Tarjeta de presentación de Alva Barber"
              loading="lazy"
            />
            <div className="TargetPresentation-content">
              {/* <h3>ALVA BARBER</h3> */}
              <h2>
                Tu próximo
                <br />
                estilo empieza aquí<span>.</span>
              </h2>
              {/* <p>Tu estilo, nuestra pasión.</p> */}
              {/* <span>EST. CUENCA · ECUADOR</span> */}
              <p>
                Elige tu servicio, encuentra tu horario y deja
                que el resto comience con una reserva.
              </p>
              <Link href="/reservar" className="alva-button-primary">
                Reservar mi cita <span>↗</span>
              </Link>
            </div>
          </div>

          {/* <h2>
            Tu próximo
            <br />
            estilo empieza aquí<span>.</span>
          </h2> */}

          {/* <p>
            Elige tu servicio, encuentra tu horario y deja
            que el resto comience con una reserva.
          </p>

          <Link href="/reservar" className="alva-button-primary">
            Reservar mi cita <span>↗</span>
          </Link> */}
        </section>

        {/* FOOTER */}
        <footer className="alva-footer">
          <Link href="/" className="alva-footer-brand">
            ALVA<span>BARBER</span>
          </Link>

          <span className="alva-footer-copy">
            © {new Date().getFullYear()} ALVA BARBER
          </span>

          <nav aria-label="Enlaces del pie de página">
            <Link href="/nosotros">Nosotros</Link>
            <Link href="/ubicacion">Ubicación</Link>
            <Link href="/privacidad">Privacidad</Link>
            <Link href="/acceso">Mi cuenta</Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}
