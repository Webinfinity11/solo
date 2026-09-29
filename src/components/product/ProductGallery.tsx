"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/brand/ProductImage";

// Main image with hover zoom (follows the cursor) and thumbnails when there are several photos.
export function ProductGallery({ name, images, label }: { name: string; images: string[]; label?: string }) {
  const [index, setIndex] = useState(0);
  const [origin, setOrigin] = useState("50% 50%");
  const [zoom, setZoom] = useState(false);
  const current = images[index];

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative aspect-square cursor-zoom-in overflow-hidden border border-line bg-white p-8"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
        }}
      >
        <span aria-hidden="true" className="hex -end-10 -top-12 h-[178px] w-[158px] opacity-25" />
        <span aria-hidden="true" className="hex -bottom-8 -start-8 h-[99px] w-[87px] opacity-20" />
        <div className="relative h-full w-full transition-transform duration-300 ease-brand" style={{ transform: zoom ? "scale(1.8)" : "none", transformOrigin: origin }}>
          <ProductImage name={name} src={current} label={label} priority sizes="(max-width: 1024px) 100vw, 560px" />
        </div>
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${name} ${i + 1}`}
              aria-pressed={i === index}
              className={cn("aspect-square border bg-white p-2 transition-colors", i === index ? "border-navy" : "border-line hover:border-blue")}
            >
              <ProductImage name={name} src={src} sizes="120px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
