"use client";

import { useEffect, useState } from "react";
import type { Product } from "./types";
import { PublicPage } from "./PublicDirectoryPage";
import { getPublicProducts } from "./publicDataCache";

export function ProductsDirectoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    void getPublicProducts().then(setProducts);
  }, []);
  return <PublicPage kicker="Cuidado masculino" title="Productos para continuar tu rutina"><div className="public-grid">{products.map((product) => <article className="public-card p-6" key={product.productid}><div className="public-card-media rounded-xl">{product.img_url ? <img src={`/uploads/${product.img_url.replace(/^\/?uploads\//, "")}`} alt="" /> : <span>{product.name[0]}</span>}</div><h2 className="mt-5 font-serif text-2xl text-[#153e38]">{product.name}</h2><p className="mt-2 text-sm leading-6 text-[#718078]">{product.description || "Producto seleccionado para tu cuidado personal."}</p><strong className="mt-4 block text-lg text-[#b97848]">${product.price.toFixed(2)}</strong></article>)}</div>{products.length === 0 && <p className="home-empty">El catálogo estará disponible próximamente.</p>}</PublicPage>;
}
