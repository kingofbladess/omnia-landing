"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { nav } from "@/content/site";
import { useAccount } from "@/lib/supabase/account";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group flex items-center gap-2.5 ${className}`} aria-label="OMNIA, inicio">
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3d7bff" />
            <stop offset="1" stopColor="#00d1ff" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="13" fill="none" stroke="url(#lg)" strokeWidth="2.5" />
        <circle cx="16" cy="16" r="5" fill="url(#lg)" className="origin-center transition-transform duration-500 group-hover:scale-125" />
        <path d="M16 3v6M16 23v6M3 16h6M23 16h6" stroke="url(#lg)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="font-display text-lg font-semibold tracking-[0.22em] text-fg">OMNIA</span>
    </Link>
  );
}

/** `areaBar`: deja espacio a la izquierda para la barra de áreas de la página principal. */
export function Header({ areaBar = false }: { areaBar?: boolean }) {
  // La sesión se mantiene al volver a la página principal: el botón lleva a tu cuenta.
  const user = useAccount();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const sections = nav.map((n) => document.getElementById(n.href.slice(1))).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const account = user ? (user.isAdmin ? { href: "/admin", label: "Panel admin" } : { href: "/cuenta", label: "Mi cuenta" }) : { href: "/acceso", label: "Acceder" };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${areaBar ? "lg:pl-20 2xl:pl-0" : ""} ${open ? "bg-bg/90 backdrop-blur-xl" : ""}`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-bg via-bg/70 to-transparent transition-opacity duration-300 ${scrolled ? "opacity-100" : "opacity-0"}`}
      />
      <div className={`relative mx-auto flex max-w-7xl items-center justify-between px-4 transition-[height] duration-300 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr] lg:px-8 ${scrolled ? "h-16" : "h-20"}`}>
        <div className="glass-pill w-fit justify-self-start rounded-full py-1.5 pl-2 pr-4">
          <Logo />
        </div>

        <nav aria-label="Principal" className="glass-pill hidden items-center gap-1 rounded-full p-1 md:flex">
          {nav.map((n) => {
            const isActive = active === n.href.slice(1);
            return (
              <Link
                key={n.href}
                href={`/${n.href}`}
                className={`relative rounded-full px-4 py-1.5 text-sm transition-colors ${isActive ? "bg-fg text-bg" : "text-muted hover:bg-white/[0.06] hover:text-fg"}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <Link
            href={account.href}
            className={`glass-pill hidden items-center gap-2 rounded-full px-4 py-2 text-sm text-fg transition-[background-color,opacity] duration-300 hover:bg-white/10 sm:inline-flex ${user === undefined ? "opacity-0" : "opacity-100"}`}
          >
            {user && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ok" />}
            {account.label}
          </Link>
          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="glass-pill relative flex h-10 w-10 items-center justify-center rounded-full md:hidden"
          >
            <span className={`absolute h-px w-4 bg-fg transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-1"}`} />
            <span className={`absolute h-px w-4 bg-fg transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-1"}`} />
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Móvil" className="h-[calc(100dvh-4rem)] border-t border-line bg-bg px-4 py-6 md:hidden">
          <ul className="space-y-1">
            {[...nav, account].map((n, i) => (
              <li key={n.href} className="reveal in" style={{ ["--d" as string]: `${i * 50}ms` }}>
                <Link
                  href={n.href.startsWith("#") ? `/${n.href}` : n.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between border-b border-line py-4 font-display text-2xl text-fg"
                >
                  {n.label}
                  <span className="font-mono text-xs text-muted">0{i + 1}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
