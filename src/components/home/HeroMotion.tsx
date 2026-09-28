"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Layered 2.5D hero animation (adapted from SOLO_Product_Animation.html):
// a photographed background and a separate vial texture drawn on a canvas.
// The background stays still; the vial floats, sways and follows the pointer,
// a light sweep crosses the glass and dust drifts. The orbit light trail of the original is left out.
//
// World space is the 1672×941 artwork. The background is scaled to cover the
// hero; the vial layer gets its own (never larger) scale so the whole vial always
// fits in the hero height, even on very wide screens.

const WORLD_W = 1672;
const WORLD_H = 941;
const VIAL = { x: 850, y: 76, w: 493, h: 725, cx: 1100, cy: 438 };
const CONFIG = { duration: 8, float: 26, sway: 16, rotation: 4, pointer: 16, particles: 90, pixelRatio: 1.7 };
const TAU = Math.PI * 2;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

export function HeroMotion({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!wrap || !canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 1;
    let height = 1;
    let ratio = 1;
    let elapsed = 0;
    let previous = 0;
    let frame = 0;
    let visible = true;
    let disposed = false;
    const pointer = { x: 0, y: 0 };
    const aim = { x: 0, y: 0 };
    let background: HTMLImageElement | null = null;
    let vial: HTMLImageElement | null = null;

    // Deterministic particles keep the motion calm and repeatable.
    let seed = 29092026;
    const random = () => {
      seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const particles = Array.from({ length: CONFIG.particles }, (_, i) => ({
      x: 480 + random() * 1170,
      y: random() * 920,
      r: 0.8 + random() * 2.4,
      phase: random() * TAU,
      drift: 7 + random() * 23,
      front: i % 5 === 0,
      alpha: 0.13 + random() * 0.32,
    }));

    const glow = document.createElement("canvas");
    glow.width = glow.height = 96;
    const g = glow.getContext("2d")!;
    const grad = g.createRadialGradient(48, 48, 0, 48, 48, 48);
    grad.addColorStop(0, "rgba(246,251,255,1)");
    grad.addColorStop(0.075, "rgba(223,241,255,.85)");
    grad.addColorStop(0.22, "rgba(177,212,244,.27)");
    grad.addColorStop(0.55, "rgba(133,190,245,.075)");
    grad.addColorStop(1, "rgba(133,190,245,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 96, 96);

    const shine = document.createElement("canvas");
    shine.width = VIAL.w;
    shine.height = VIAL.h;
    const sc = shine.getContext("2d")!;

    function layout() {
      // Background: cover, with the vial placed at ~68% of the width on wide heroes.
      const bgScale = Math.max(width / WORLD_W, height / WORLD_H) * 1.08;
      const focusX = width >= 1280 ? 0.68 : 0.55;
      const ox = Math.min(0, Math.max(width - WORLD_W * bgScale, focusX * width - VIAL.cx * bgScale));
      const oy = Math.min(0, Math.max(height - WORLD_H * bgScale, height / 2 - VIAL.cy * bgScale));
      // Vial: same size as in the artwork unless that would crop it.
      const vialScale = Math.min(bgScale, (height * 0.94) / VIAL.h, (width * 0.9) / VIAL.w);
      return { bgScale, ox, oy, vialScale, vx: ox + VIAL.cx * bgScale, vy: oy + VIAL.cy * bgScale };
    }

    function dust(t: number, front: boolean) {
      ctx!.save();
      ctx!.globalCompositeOperation = "screen";
      const ph = (TAU * t) / CONFIG.duration;
      for (const p of particles) {
        if (p.front !== front) continue;
        const x = p.x + Math.sin(ph + p.phase) * p.drift + pointer.x * (front ? 10 : 3);
        const y = p.y + Math.cos(ph + p.phase) * p.drift * 0.8;
        const r = p.r * (front ? 5 : 3);
        ctx!.globalAlpha = p.alpha * (0.7 + 0.3 * Math.sin(ph * 2 + p.phase)) * (front ? 0.8 : 1);
        ctx!.drawImage(glow, x - r * 2, y - r * 2, r * 4, r * 4);
      }
      ctx!.restore();
    }

    function render(t: number) {
      if (!background || !vial) return;
      const L = layout();
      const phase = (TAU * t) / CONFIG.duration;
      const dx = Math.sin(phase) * CONFIG.sway + pointer.x * CONFIG.pointer;
      const dy = -Math.sin(phase) * CONFIG.float + pointer.y * 8;
      const angle = (Math.sin(phase - 0.45) * CONFIG.rotation * Math.PI) / 180;

      ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx!.fillStyle = "#030c17";
      ctx!.fillRect(0, 0, width, height);

      // Background layer.
      ctx!.setTransform(ratio * L.bgScale, 0, 0, ratio * L.bgScale, ratio * L.ox, ratio * L.oy);
      // Static background: only the vial (and the dust around it) moves.
      ctx!.save();
      ctx!.translate(WORLD_W / 2, WORLD_H / 2);
      ctx!.scale(1.03, 1.03);
      ctx!.translate(-WORLD_W / 2, -WORLD_H / 2);
      ctx!.drawImage(background, 0, 0, WORLD_W, WORLD_H);
      ctx!.restore();
      dust(t, false);

      // Vial layer: world coordinates around the vial centre, own scale.
      const vs = L.vialScale;
      ctx!.setTransform(ratio * vs, 0, 0, ratio * vs, ratio * (L.vx - VIAL.cx * vs), ratio * (L.vy - VIAL.cy * vs));

      // Soft grounding shadow that breathes with the float.
      ctx!.save();
      ctx!.translate(1100, 835);
      ctx!.scale(1, 0.12);
      const shadow = ctx!.createRadialGradient(0, 0, 0, 0, 0, 196);
      shadow.addColorStop(0, `rgba(3,12,23,${0.14 + 0.025 * Math.sin(phase)})`);
      shadow.addColorStop(1, "rgba(3,12,23,0)");
      ctx!.fillStyle = shadow;
      ctx!.fillRect(-200, -200, 400, 400);
      ctx!.restore();

      ctx!.save();
      ctx!.translate(VIAL.cx + dx, VIAL.cy + dy);
      ctx!.rotate(angle);
      const s = 1.012 + Math.sin(phase) * 0.004;
      ctx!.scale(s, s);
      ctx!.transform(1, 0.0015 * Math.sin(phase), 0.006 * Math.sin(phase), 1, 0, 0);
      ctx!.drawImage(vial, VIAL.x - VIAL.cx, VIAL.y - VIAL.cy, VIAL.w, VIAL.h);
      // Light sweep across the glass, masked to the vial's own alpha.
      const pos = ((t / CONFIG.duration + 0.17) % 1) * 1750 - 550;
      sc.clearRect(0, 0, VIAL.w, VIAL.h);
      sc.globalCompositeOperation = "source-over";
      sc.drawImage(vial, 0, 0, VIAL.w, VIAL.h);
      sc.globalCompositeOperation = "source-in";
      const light = sc.createLinearGradient(pos - 185, 0, pos + 130, VIAL.h);
      light.addColorStop(0, "rgba(223,242,255,0)");
      light.addColorStop(0.4, "rgba(223,242,255,0)");
      light.addColorStop(0.5, "rgba(223,242,255,.115)");
      light.addColorStop(0.56, "rgba(255,255,255,.16)");
      light.addColorStop(0.72, "rgba(223,242,255,.02)");
      light.addColorStop(1, "rgba(223,242,255,0)");
      sc.fillStyle = light;
      sc.fillRect(0, 0, VIAL.w, VIAL.h);
      sc.globalCompositeOperation = "source-over";
      ctx!.globalCompositeOperation = "screen";
      ctx!.drawImage(shine, VIAL.x - VIAL.cx, VIAL.y - VIAL.cy, VIAL.w, VIAL.h);
      ctx!.restore();

      // Studio flare at the base.
      ctx!.save();
      ctx!.globalCompositeOperation = "screen";
      ctx!.globalAlpha = 0.16 + 0.065 * Math.sin(phase);
      ctx!.drawImage(glow, 918, 756, 116, 116);
      ctx!.restore();

      // Foreground dust in background space.
      ctx!.setTransform(ratio * L.bgScale, 0, 0, ratio * L.bgScale, ratio * L.ox, ratio * L.oy);
      dust(t, true);
    }

    function resize() {
      const r = wrap!.getBoundingClientRect();
      width = Math.max(1, r.width);
      height = Math.max(1, r.height);
      ratio = Math.min(window.devicePixelRatio || 1, CONFIG.pixelRatio);
      canvas!.width = Math.round(width * ratio);
      canvas!.height = Math.round(height * ratio);
      render(elapsed);
    }

    function tick(now: number) {
      frame = requestAnimationFrame(tick);
      const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      if (document.hidden || !visible || reduced.matches) return;
      elapsed += dt;
      pointer.x += (aim.x - pointer.x) * 0.045;
      pointer.y += (aim.y - pointer.y) * 0.045;
      render(elapsed);
    }

    // Pointer parallax follows the whole hero, not only the canvas.
    const hero = wrap.closest("section") ?? wrap;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = hero.getBoundingClientRect();
      aim.x = (e.clientX - r.left) / r.width - 0.5;
      aim.y = (e.clientY - r.top) / r.height - 0.5;
    };
    const onLeave = () => {
      aim.x = 0;
      aim.y = 0;
    };
    const onVisibility = () => {
      previous = performance.now();
    };
    hero.addEventListener("pointermove", onMove as EventListener);
    hero.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(wrap);
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    Promise.all([loadImage("/images/hero/background.webp"), loadImage("/images/hero/vial.webp")])
      .then(([bg, v]) => {
        if (disposed) return;
        background = bg;
        vial = v;
        resize();
        setReady(true);
        frame = requestAnimationFrame(tick);
      })
      .catch(() => {
        /* the static poster stays visible */
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      hero.removeEventListener("pointermove", onMove as EventListener);
      hero.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={wrapRef} aria-hidden="true" className={cn("relative h-full w-full overflow-hidden bg-[#030c17]", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* Static poster until the layers are decoded (and for no-JS). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hero/poster.webp"
        alt=""
        className={cn("absolute inset-0 h-full w-full object-cover object-[68%_46%] transition-opacity duration-300", ready && "opacity-0")}
      />
    </div>
  );
}
