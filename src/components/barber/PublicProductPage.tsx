// "use client";

// import { useEffect, useState } from "react";
// import type { Product } from "./types";
// import { PublicPage } from "./PublicDirectoryPage";
// import { getPublicProducts } from "./publicDataCache";

// export function ProductsDirectoryPage() {
//   const [products, setProducts] = useState<Product[]>([]);
//   useEffect(() => {
//     void getPublicProducts().then(setProducts);
//   }, []);
//   return <PublicPage kicker="Cuidado masculino" title="Productos para continuar tu rutina"><div className="public-grid">{products.map((product) => <article className="public-card p-6" key={product.productid}><div className="public-card-media rounded-xl">{product.img_url ? <img src={`/uploads/${product.img_url.replace(/^\/?uploads\//, "")}`} alt="" /> : <span>{product.name[0]}</span>}</div><h2 className="mt-5 font-serif text-2xl text-[#153e38]">{product.name}</h2><p className="mt-2 text-sm leading-6 text-[#718078]">{product.description || "Producto seleccionado para tu cuidado personal."}</p><strong className="mt-4 block text-lg text-[#b97848]">${product.price.toFixed(2)}</strong></article>)}</div>{products.length === 0 && <p className="home-empty">El catálogo estará disponible próximamente.</p>}</PublicPage>;
// }



"use client";

import { useEffect, useState } from "react";
import type { Product } from "./types";
import { PublicPage } from "./PublicDirectoryPage";
import { getPublicProducts } from "./publicDataCache";

// IMPORTANTE:
// Coloca el número de WhatsApp de ALVA BARBER.
// Formato internacional sin +, espacios ni guiones.
// Ejemplo Ecuador: 593991234567
const WHATSAPP_NUMBER = "593XXXXXXXXX";

function productImageUrl(value?: string | null): string | null {
  if (!value) return null;

  return value.startsWith("http")
    ? value
    : `/uploads/${value.replace(/^\/?uploads\//, "")}`;
}

function getWhatsAppUrl(product: Product) {
  const message = [
    "Hola, estoy interesado en un producto de ALVA BARBER.",
    "",
    `Producto: ${product.name}`,
    `Precio: $${Number(product.price).toFixed(2)}`,
    "",
    "¿Podrían darme más información y confirmar su disponibilidad?"
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function ProductsDirectoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getPublicProducts()
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch((error) => {
        console.error("No se pudieron cargar los productos:", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <PublicPage
      kicker="Cuidado masculino"
      title="Productos para continuar tu rutina"
    >
      <div className="products-page">
        <section className="products-catalog">
          <div className="products-catalog-heading">
            <div>
              <span className="products-eyebrow">
                NUESTROS PRODUCTOS
              </span>
              <span className="products-heading-line" />
            </div>

            <span className="products-count">
              {products.length}{" "}
              {products.length === 1 ? "producto" : "productos"}
            </span>
          </div>

          {/* CARGA */}

          {loading ? (
            <div className="products-feedback">
              <span className="products-loader" />
              <p>Cargando productos...</p>
            </div>
          ) : products.length > 0 ? (

            /* PRODUCTOS */

            <div className="products-grid">
              {products.map((product, index) => {
                const image = productImageUrl(product.img_url);

                return (
                  <article
                    className="products-card"
                    key={product.productid}
                  >
                    <div className="products-card-image">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          loading="lazy"
                        />
                      ) : (
                        <div className="products-image-placeholder">
                          <span>
                            {product.name?.charAt(0).toUpperCase() || "A"}
                          </span>
                        </div>
                      )}

                      <span className="products-local-label">
                        DISPONIBLE EN EL LOCAL
                      </span>
                    </div>

                    <div className="products-card-content">
                      <span className="products-card-number">
                        PRODUCTO {String(index + 1).padStart(2, "0")}
                      </span>

                      <h3>{product.name}</h3>

                      <p className="products-card-description">
                        {product.description ||
                          "Un producto seleccionado para complementar tu cuidado personal."}
                      </p>

                      <div className="products-card-bottom">
                        <div className="products-price">
                          <span>PRECIO</span>
                          <strong>
                            ${Number(product.price).toFixed(2)}
                          </strong>
                        </div>

                        <a
                          href={getWhatsAppUrl(product)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="products-whatsapp-button"
                        >
                          Consultar
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path d="M7 17 17 7M7 7h10v10" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="products-empty">
              <span>—</span>
              <h3>Próximamente</h3>
              <p>
                Estamos preparando nuestra selección de productos
                para ti.
              </p>
            </div>
          )}
        </section>

        {/* CIERRE */}

        {!loading && products.length > 0 && (
          <section className="products-contact">
            <div>
              <span className="products-eyebrow">
                ¿NECESITAS ASESORÍA?
              </span>
              <h3>
                Te ayudamos a elegir
                <br />
                el producto ideal.
              </h3>
            </div>

            <p>
              Visítanos en ALVA BARBER o escríbenos.
              Nuestro equipo te ayudará a encontrar
              lo que necesitas.
            </p>
          </section>
        )}

      </div>
    </PublicPage>
  );
}
