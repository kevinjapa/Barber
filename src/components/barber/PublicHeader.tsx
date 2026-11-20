"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const router = useRouter();
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setSession(readCustomerSession()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function signOut() {
    if (session?.session_token) {
      void fetch("/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.session_token}` },
      });
    }
    window.localStorage.removeItem(customerSessionKey);
    setSession(null);
    setAccountMenuOpen(false);
    router.replace("/");
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
          <div className="public-account-menu">
            <button
              type="button"
              className="public-account-trigger"
              aria-label="Abrir menú de usuario"
              aria-haspopup="menu"
              aria-expanded={accountMenuOpen}
              onClick={() => setAccountMenuOpen((open) => !open)}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M4.5 20c.7-3.7 3.4-5.7 7.5-5.7s6.8 2 7.5 5.7" />
              </svg>
            </button>
            {accountMenuOpen && (
              <div className="public-account-dropdown" role="menu">
                <p className="public-account-greeting">Hola, {session.name}</p>
                <Link href="/perfil" role="menuitem" onClick={() => setAccountMenuOpen(false)}>Mi perfil</Link>
                <Link href="/reservas" role="menuitem" onClick={() => setAccountMenuOpen(false)}>Mis reservas</Link>
                <Link href="/reservar" role="menuitem" onClick={() => setAccountMenuOpen(false)}>Reservar ahora</Link>
                <button type="button" role="menuitem" onClick={signOut}>Salir</button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/acceso" className="public-account-trigger" aria-label="Iniciar sesión">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M4.5 20c.7-3.7 3.4-5.7 7.5-5.7s6.8 2 7.5 5.7" />
            </svg>
          </Link>
        )}
        <Link href="/reservar" className="public-header-cta">Reservar ahora</Link>
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
