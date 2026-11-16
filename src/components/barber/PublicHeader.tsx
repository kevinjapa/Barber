"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

export type CustomerSession = {
  clientid: number;
  dni: string;
  name: string;
  last_name: string;
  email: string;
  phone?: string;
  session_token?: string;
};

export const customerSessionKey = "barberhub.customer-session";

export function readCustomerSession(): CustomerSession | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(customerSessionKey);
  if (!value) return null;
  try {
    const session = JSON.parse(value) as CustomerSession;
    return typeof session.clientid === "number" ? session : null;
  } catch {
    window.localStorage.removeItem(customerSessionKey);
    return null;
  }
}

export function PublicHeader() {
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setSession(readCustomerSession()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function signOut() {
    window.localStorage.removeItem(customerSessionKey);
    setSession(null);
  }

  return (
    <header className="public-header">
      <Link href="/" className="flex items-center gap-3">
        <img src="/assets/alvaberber_icon.png" alt="Alva Academy" className="booking-mark" />
        <span className="font-serif text-xl tracking-tight">Alva Academy</span>
      </Link>
      <nav className="public-nav" aria-label="Navegación principal">
        <Link href="/">Home</Link>
        <Link href="/servicios">Servicios</Link>
        <Link href="/productos">Productos</Link>
        <Link href="/nosotros">Nosotros</Link>
        {session && <Link href="/reservas">Mis reservas</Link>}
      </nav>
      <button
        type="button"
        className="public-menu-toggle"
        aria-expanded={menuOpen}
        aria-controls="public-mobile-nav"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
        <span className="sr-only">Abrir menú</span>
      </button>
      <div className="flex items-center gap-3">
        {session ? (
          <>
            <Link href="/perfil" className="public-account-link">
              Hola, Bienvenido {session.name}
            </Link>
            <button type="button" onClick={signOut} className="public-signout">Salir</button>
          </>
        ) : (
          <Link href="/acceso" className="public-account-link">Iniciar sesión</Link>
        )}
        <Link href="/reservar" className="public-header-cta">Reservar ahora</Link>
        {/* <ThemeToggle /> */}
      </div>
      {menuOpen && (
        <nav id="public-mobile-nav" className="public-mobile-nav" aria-label="Menú móvil">
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/nosotros" onClick={() => setMenuOpen(false)}>Nosotros</Link>
          <Link href="/servicios" onClick={() => setMenuOpen(false)}>Servicios</Link>
          <Link href="/productos" onClick={() => setMenuOpen(false)}>Productos</Link>
          {session && <Link href="/reservas" onClick={() => setMenuOpen(false)}>Mis reservas</Link>}
          <Link href="/reservar" className="public-header-cta" onClick={() => setMenuOpen(false)}>Reservar ahora</Link>
        </nav>
      )}
    </header>
  );
}
