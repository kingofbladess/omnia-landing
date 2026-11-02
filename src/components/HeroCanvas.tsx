"use client";

import { useEffect, useRef } from "react";

type Node = { x: number; y: number; vx: number; vy: number; r: number };

/**
 * Red de nodos que reacciona al cursor: los nodos cercanos se conectan
 * y se iluminan, como tráfico moviéndose por un data center.
 */
export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let nodes: Node[] = [];
    const pointer = { x: -9999, y: -9999, active: false };
    let raf = 0;
    let visible = true;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(110, (w * h) / 11000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.6,
      }));
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      const linkDist = 120;
      const mouseDist = 190;

      for (const n of nodes) {
        if (!reduced) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0 || n.y > h) n.vy *= -1;
          if (pointer.active) {
            const dx = n.x - pointer.x;
            const dy = n.y - pointer.y;
            const d = Math.hypot(dx, dy);
            if (d < 90 && d > 0.1) {
              n.x += (dx / d) * 0.9;
              n.y += (dy / d) * 0.9;
            }
          }
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < linkDist) {
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const near = pointer.active ? Math.max(0, 1 - Math.hypot(mx - pointer.x, my - pointer.y) / mouseDist) : 0;
            const alpha = (1 - d / linkDist) * (0.12 + near * 0.75);
            ctx!.strokeStyle = near > 0.05 ? `rgba(0,209,255,${alpha})` : `rgba(120,150,230,${alpha})`;
            ctx!.lineWidth = 0.6 + near;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      for (const n of nodes) {
        const near = pointer.active ? Math.max(0, 1 - Math.hypot(n.x - pointer.x, n.y - pointer.y) / mouseDist) : 0;
        ctx!.fillStyle = near > 0.05 ? `rgba(160,235,255,${0.5 + near * 0.5})` : "rgba(150,175,240,0.55)";
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r + near * 1.8, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function loop() {
      if (visible) draw();
      if (!reduced) raf = requestAnimationFrame(loop);
    }

    function onMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = pointer.y >= 0 && pointer.y <= rect.height;
      if (reduced) draw();
    }
    function onLeave() {
      pointer.active = false;
    }

    resize();
    loop();
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw();
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

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />;
}
