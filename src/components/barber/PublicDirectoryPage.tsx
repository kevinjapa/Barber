"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { PublicHeader } from "./PublicHeader";
import type { Service } from "./types";
import { getPublicBarbers, getPublicServices } from "./publicDataCache";

type Barber = { empid: number; name: string; last_name: string; photo_url?: string | null };

function imageUrl(value?: string | null) {
  return value ? (value.startsWith("http") ? value : `/uploads/${value.replace(/^\/?uploads\//, "")}`) : null;
}

export function ServicesDirectoryPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [query, setQuery] = useState("");
  const [minimum, setMinimum] = useState("");
  const [maximum, setMaximum] = useState("");
  useEffect(() => {
    void getPublicServices().then(setServices);
  }, []);
  return (
    <PublicPage title="Servicios pensados para ti" kicker="Nuestra carta">
      <div className="service-filters">
        <input aria-label="Buscar servicio" placeholder="Buscar por nombre..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <input aria-label="Precio mínimo" type="number" min="0" placeholder="Precio mínimo" value={minimum} onChange={(event) => setMinimum(event.target.value)} />
        <input aria-label="Precio máximo" type="number" min="0" placeholder="Precio máximo" value={maximum} onChange={(event) => setMaximum(event.target.value)} />
        <button type="button" onClick={() => { setQuery(""); setMinimum(""); setMaximum(""); }} className="action-secondary px-4 py-3 text-sm font-bold">Limpiar</button>
      </div>
      <div className="public-grid">
        {services.filter((service) => {
          const normalized = query.trim().toLowerCase();
          const price = Number(service.price);
          return (!normalized || service.name.toLowerCase().includes(normalized)) &&
            (!minimum || price >= Number(minimum)) &&
            (!maximum || price <= Number(maximum));
        }).map((service) => (
          <article className="public-card overflow-hidden" key={service.serviceid}>
            <div className="public-card-media">{service.img_url ? <img src={imageUrl(service.img_url) ?? ""} alt="" /> : <span>{service.name[0]}</span>}</div>
            <div className="p-6">
              <div className="flex justify-between gap-4"><h2 className="font-serif text-2xl text-[#153e38]">{service.name}</h2><strong className="text-[#b97848]">${service.price.toFixed(2)}</strong></div>
              <p className="mt-3 text-sm leading-6 text-[#718078]">{service.description || "Un servicio personalizado para renovar tu estilo."}</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#1d5b4f]">{service.duration} minutos</p>
              <Link href={`/reservar?service=${service.serviceid}`} className="booking-submit mt-5 inline-block">Reservar</Link>
            </div>
          </article>
        ))}
      </div>
    </PublicPage>
  );
}

export function BarbersDirectoryPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  useEffect(() => {
    void getPublicBarbers().then(setBarbers);
  }, []);
  return (
    <PublicPage title="Conoce al equipo" kicker="Nuestro team">
      <div className="public-grid sm:grid-cols-2 lg:grid-cols-4">
        {barbers.map((barber) => (
          <article className="public-card p-6" key={barber.empid}>
            <div className="public-avatar">{imageUrl(barber.photo_url) ? <img src={imageUrl(barber.photo_url) ?? ""} alt="" /> : `${barber.name[0]}${barber.last_name[0]}`}</div>
            <h2 className="mt-5 font-serif text-2xl text-[#153e38]">{barber.name} {barber.last_name}</h2>
            <p className="mt-2 text-sm text-[#718078]">Barbero especialista</p>
            <Link href={`/reservar?barber=${barber.empid}`} className="mt-5 inline-block text-sm font-bold text-[#1d5b4f]">Elegir barbero →</Link>
          </article>
        ))}
      </div>
    </PublicPage>
  );
}

export function PublicPage({ title, kicker, children }: { title: string; kicker: string; children: ReactNode }) {
  return (
    <main className="booking-shell min-h-screen">
      <div className="public-container">
        <PublicHeader />
        <section className="public-hero"><p className="booking-kicker">{kicker}</p><h1>{title}</h1></section>
        {children}
      </div>
    </main>
  );
}
