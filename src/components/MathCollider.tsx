"use client";

import { useEffect, useRef } from "react";

/**
 * Animación del acceso: números que flotan en el espacio y, al chocar, se combinan
 * sumando (+), restando (−), multiplicando (×) o dividiendo (÷).
 * Fondo: estrellas en tres profundidades, que titilan, con alguna estrella fugaz.
 */

type Op = "+" | "−" | "×" | "÷";
type RGB = [number, number, number];
type P = { id: number; x: number; y: number; vx: number; vy: number; z: number; v: number; r: number; born: number; flash: number; op: Op | null; phase: number };
type Label = { x: number; y: number; text: string; op: Op; born: number };
type Star = { x: number; y: number; z: number; tw: number; sp: number };
type Shooting = { x: number; y: number; vx: number; vy: number; born: number };

const MAX = 999;
const COOLDOWN = 900; // ms antes de que un número recién creado pueda volver a combinarse
const LABEL_MS = 2200;

function readToken(token: string): RGB {
  const hex = getComputedStyle(document.documentElement).getPropertyValue(token).trim().replace("#", "");
  if (hex.length !== 6) return [61, 123, 255];
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
}
const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const sizeFor = (z: number) => 13 + 8 * z; // tamaño de letra según la profundidad
const radiusFor = (v: number, z: number) => 6 + String(v).length * sizeFor(z) * 0.33;

/** Elige una operación válida para dos números (o null si ninguna cabe). */
function combine(a: number, b: number): { op: Op; result: number; text: string } | null {
  const [hi, lo] = a >= b ? [a, b] : [b, a];
  const options: { op: Op; result: number; text: string; weight: number }[] = [];
  if (a + b <= MAX) options.push({ op: "+", result: a + b, text: `${a} + ${b} = ${a + b}`, weight: 3 });
  if (hi - lo >= 1) options.push({ op: "−", result: hi - lo, text: `${hi} − ${lo} = ${hi - lo}`, weight: 3 });
  if (a * b <= MAX && lo > 1) options.push({ op: "×", result: a * b, text: `${a} × ${b} = ${a * b}`, weight: 4 });
  if (lo > 1 && hi % lo === 0) options.push({ op: "÷", result: hi / lo, text: `${hi} ÷ ${lo} = ${hi / lo}`, weight: 4 });
  if (!options.length) return null;
  let pick = Math.random() * options.reduce((s, o) => s + o.weight, 0);
  for (const o of options) {
    pick -= o.weight;
    if (pick <= 0) return o;
  }
  return options[0];
}

export function MathCollider() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = getComputedStyle(document.documentElement);
    const font = root.getPropertyValue("--font-display").trim() || "system-ui, sans-serif";
    const colors: Record<Op, RGB> = {
      "+": readToken("--accent-2"),
      "−": readToken("--warn"),
      "×": readToken("--accent-3"),
      "÷": readToken("--ok"),
    };
    const fg = readToken("--fg");
    const starTint: RGB = [200, 215, 255];

    let w = 0;
    let h = 0;
    let top = 0; // límite superior de la zona de los números (debajo del logo)
    let bottom = 0; // límite inferior (encima del texto)
    let target = 14;
    let ps: P[] = [];
    let labels: Label[] = [];
    let stars: Star[] = [];
    let shooting: Shooting | null = null;
    let nextShooting = 0;
    let nextId = 0;
    let raf = 0;
    let visible = true;
    const pending: number[] = [];
    const pointer = { x: -9999, y: -9999, px: 0, py: 0 };

    function spawn(now: number, edge: boolean): P {
      const v = 1 + Math.floor(Math.random() * 12);
      const z = 0.45 + Math.random() * 0.55;
      const r = radiusFor(v, z);
      let x = r + Math.random() * (w - 2 * r);
      let y = top + r + Math.random() * (bottom - top - 2 * r);
      if (edge) {
        const side = Math.floor(Math.random() * 4);
        if (side === 0) x = r;
        if (side === 1) x = w - r;
        if (side === 2) y = top + r;
        if (side === 3) y = bottom - r;
      }
      const a = Math.random() * Math.PI * 2;
      const speed = (0.2 + Math.random() * 0.3) * (0.6 + z * 0.4);
      return { id: nextId++, x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, z, v, r, born: now, flash: 0, op: null, phase: Math.random() * Math.PI * 2 };
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      top = 110;
      bottom = Math.max(top + 260, h - 250);
      target = Math.max(9, Math.min(16, Math.round((w * (bottom - top)) / 26000)));
      const now = performance.now() - COOLDOWN;
      ps = Array.from({ length: target }, () => spawn(now, false));
      labels = [];
      const count = Math.round((w * h) / 1500);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() ** 2, // la mayoría lejanas y tenues
        tw: Math.random() * Math.PI * 2,
        sp: 0.6 + Math.random() * 1.8,
      }));
    }

    function step(now: number) {
      // Parallax suave hacia el cursor
      if (pointer.x > -9000) {
        pointer.px += ((pointer.x - w / 2) / w - pointer.px) * 0.03;
        pointer.py += ((pointer.y - h / 2) / h - pointer.py) * 0.03;
      } else {
        pointer.px *= 0.97;
        pointer.py *= 0.97;
      }

      // Las estrellas derivan muy despacio (más rápido las cercanas)
      for (const s of stars) {
        s.x -= 0.03 + s.z * 0.12;
        if (s.x < -2) {
          s.x = w + 2;
          s.y = Math.random() * h;
        }
      }

      // Estrella fugaz de vez en cuando
      if (!shooting && now > nextShooting) {
        if (nextShooting) shooting = { x: w * (0.3 + Math.random() * 0.7), y: Math.random() * h * 0.4, vx: -(5 + Math.random() * 3), vy: 2 + Math.random() * 1.5, born: now };
        nextShooting = now + 5000 + Math.random() * 7000;
      }
      if (shooting && now - shooting.born > 900) shooting = null;

      // Números: deriva lenta tipo gravedad cero, rebote en bordes, se apartan del cursor
      for (const p of ps) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d = Math.hypot(dx, dy);
        if (d < 110 && d > 0.1) {
          p.vx += (dx / d) * 0.03;
          p.vy += (dy / d) * 0.03;
        }
        const sp = Math.hypot(p.vx, p.vy);
        const maxSp = 0.85 * (0.6 + p.z * 0.4);
        if (sp > maxSp) {
          p.vx *= maxSp / sp;
          p.vy *= maxSp / sp;
        }
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < p.r) {
          p.x = p.r;
          p.vx = Math.abs(p.vx);
        }
        if (p.x > w - p.r) {
          p.x = w - p.r;
          p.vx = -Math.abs(p.vx);
        }
        if (p.y < top + p.r) {
          p.y = top + p.r;
          p.vy = Math.abs(p.vy);
        }
        if (p.y > bottom - p.r) {
          p.y = bottom - p.r;
          p.vy = -Math.abs(p.vy);
        }
      }

      // Colisiones
      const removed = new Set<number>();
      const born: P[] = [];
      for (let i = 0; i < ps.length; i++) {
        const a = ps[i];
        if (removed.has(a.id)) continue;
        for (let j = i + 1; j < ps.length; j++) {
          const b = ps[j];
          if (removed.has(b.id)) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.hypot(dx, dy);
          if (d >= a.r + b.r || d === 0) continue;

          const ready = now - a.born > COOLDOWN && now - b.born > COOLDOWN;
          const res = ready ? combine(a.v, b.v) : null;
          if (res) {
            removed.add(a.id).add(b.id);
            const z = Math.max(a.z, b.z);
            const x = (a.x + b.x) / 2;
            const y = (a.y + b.y) / 2;
            born.push({ id: nextId++, x, y, vx: (a.vx + b.vx) / 2, vy: (a.vy + b.vy) / 2, z, v: res.result, r: radiusFor(res.result, z), born: now, flash: now, op: res.op, phase: Math.random() * Math.PI * 2 });
            labels.push({ x, y: y - sizeFor(z) - 14, text: res.text, op: res.op, born: now });
            pending.push(now + 1200 + Math.random() * 1200);
            break;
          }
          // Rebote suave si no se pueden combinar
          const nx = dx / d;
          const ny = dy / d;
          const overlap = a.r + b.r - d;
          a.x -= nx * overlap * 0.5;
          a.y -= ny * overlap * 0.5;
          b.x += nx * overlap * 0.5;
          b.y += ny * overlap * 0.5;
          const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rel < 0) {
            a.vx += rel * nx;
            a.vy += rel * ny;
            b.vx -= rel * nx;
            b.vy -= rel * ny;
          }
        }
      }
      if (removed.size) ps = ps.filter((p) => !removed.has(p.id)).concat(born);

      // Reponer números desde los bordes para que nunca se vacíe
      for (let k = pending.length - 1; k >= 0; k--) {
        if (now >= pending[k] && ps.length < target) {
          ps.push(spawn(now, true));
          pending.splice(k, 1);
        }
      }
      while (ps.length + pending.length < target) pending.push(now + 800);
      labels = labels.filter((l) => now - l.born < LABEL_MS);
    }

    function draw(now: number) {
      ctx!.clearRect(0, 0, w, h);
      const ox = pointer.px * 18;
      const oy = pointer.py * 18;

      // Estrellas
      for (const s of stars) {
        const tw = 0.55 + 0.45 * Math.sin(now * 0.001 * s.sp + s.tw);
        const a = (0.25 + s.z * 0.75) * tw;
        const size = 0.6 + s.z * 1.4;
        const x = s.x + ox * s.z;
        const y = s.y + oy * s.z;
        ctx!.fillStyle = rgba(starTint, a);
        ctx!.fillRect(x, y, size, size);
        if (s.z > 0.85) {
          // destello en cruz para las más brillantes
          ctx!.fillStyle = rgba(starTint, a * 0.35);
          ctx!.fillRect(x - size * 2, y + size / 2 - 0.25, size * 5, 0.5);
          ctx!.fillRect(x + size / 2 - 0.25, y - size * 2, 0.5, size * 5);
        }
      }

      // Estrella fugaz
      if (shooting) {
        const t = (now - shooting.born) / 900;
        const x = shooting.x + shooting.vx * t * 60;
        const y = shooting.y + shooting.vy * t * 60;
        const g = ctx!.createLinearGradient(x, y, x - shooting.vx * 14, y - shooting.vy * 14);
        g.addColorStop(0, rgba(starTint, 0.9 * (1 - t)));
        g.addColorStop(1, rgba(starTint, 0));
        ctx!.strokeStyle = g;
        ctx!.lineWidth = 1.2;
        ctx!.beginPath();
        ctx!.moveTo(x, y);
        ctx!.lineTo(x - shooting.vx * 14, y - shooting.vy * 14);
        ctx!.stroke();
      }

      // Constelaciones: líneas finas entre números cercanos
      const pos = ps.map((p) => ({
        x: p.x + ox * p.z * 1.6,
        y: p.y + oy * p.z * 1.6 + Math.sin(now * 0.0012 + p.phase) * 3 * p.z,
      }));
      ctx!.lineWidth = 0.6;
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const d = Math.hypot(pos[i].x - pos[j].x, pos[i].y - pos[j].y);
          if (d < 150) {
            ctx!.strokeStyle = rgba(starTint, (1 - d / 150) * 0.12);
            ctx!.beginPath();
            ctx!.moveTo(pos[i].x, pos[i].y);
            ctx!.lineTo(pos[j].x, pos[j].y);
            ctx!.stroke();
          }
        }
      }

      // Números
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      ps.forEach((p, i) => {
        const { x, y } = pos[i];
        const appear = Math.min(1, (now - p.born) / 900);
        const flash = p.flash ? Math.max(0, 1 - (now - p.flash) / 1400) : 0;
        const c = p.op ? colors[p.op] : starTint;
        const size = sizeFor(p.z) * (1 + flash * 0.18);

        if (flash > 0) {
          // anillo fino que se expande al fusionarse
          ctx!.strokeStyle = rgba(c, flash * 0.35);
          ctx!.lineWidth = 0.8;
          ctx!.beginPath();
          ctx!.arc(x, y, p.r + (1 - flash) * 28, 0, Math.PI * 2);
          ctx!.stroke();
        }

        ctx!.font = `300 ${size.toFixed(1)}px ${font}`;
        ctx!.shadowColor = rgba(c, 0.55 + flash * 0.4);
        ctx!.shadowBlur = 6 + flash * 14;
        ctx!.fillStyle = rgba(flash > 0.02 ? c : fg, (0.45 + p.z * 0.5) * appear);
        ctx!.fillText(String(p.v), x, y);
        ctx!.shadowBlur = 0;
      });

      // Ecuaciones: aparecen, suben despacio y se desvanecen
      ctx!.font = `400 11px ${font}`;
      for (const l of labels) {
        const t = (now - l.born) / LABEL_MS;
        const alpha = t < 0.12 ? t / 0.12 : 1 - (t - 0.12) / 0.88;
        ctx!.fillStyle = rgba(colors[l.op], 0.85 * alpha);
        ctx!.fillText(l.text, l.x, l.y - t * 22);
      }
    }

    function loop(now: number) {
      if (visible) {
        step(now);
        draw(now);
      }
      raf = requestAnimationFrame(loop);
    }

    function onMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    }
    function onLeave() {
      pointer.x = pointer.y = -9999;
    }

    resize();
    if (reduced) {
      // Sin animación: una composición estática con ecuaciones de ejemplo
      const now = performance.now();
      labels = [
        { x: w * 0.3, y: top + (bottom - top) * 0.2, text: "6 × 7 = 42", op: "×", born: now - 300 },
        { x: w * 0.68, y: top + (bottom - top) * 0.45, text: "48 ÷ 6 = 8", op: "÷", born: now - 300 },
        { x: w * 0.35, y: top + (bottom - top) * 0.7, text: "15 − 9 = 6", op: "−", born: now - 300 },
      ];
      draw(now);
    } else {
      raf = requestAnimationFrame(loop);
    }

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(performance.now());
    });
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full" />;
}
