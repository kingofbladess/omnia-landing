"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { nav } from "@/content/site";

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

export function Header({ user }: { user?: { isAdmin: boolean } | null }) {
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
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open ? "border-b border-line bg-bg/80 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Principal" className="hidden items-center gap-1 rounded-full border border-line bg-white/[0.02] p-1 md:flex">
          {nav.map((n) => {
            const isActive = active === n.href.slice(1);
            return (
              <Link
                key={n.href}
                href={`/${n.href}`}
                className={`relative rounded-full px-4 py-1.5 text-sm transition-colors ${isActive ? "bg-white/[0.08] text-fg" : "text-muted hover:text-fg"}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={account.href}
            className="hidden rounded-full border border-line-strong px-4 py-1.5 text-sm text-fg transition-colors hover:border-accent-2/60 hover:bg-white/5 sm:inline-flex"
          >
            {account.label}
          </Link>
          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line md:hidden"
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
