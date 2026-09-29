import Image from "next/image";
import { useId } from "react";
import { cn } from "@/lib/utils";
import { LogoMark, LOGO_FONT } from "./LogoMark";

// Product visual: a real photo when one is supplied, otherwise a crisp vector vial in
// the style of the hero video (glass body, metal crimp, navy/white SOLO label).
export function ProductImage({
  name,
  src,
  label,
  className,
  sizes = "(max-width: 700px) 50vw, 300px",
  priority,
}: {
  name: string;
  src?: string;
  label?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  // Unique per instance: Chrome ignores gradients defined inside a hidden (display:none) SVG,
  // and the same vial also renders in the closed search dialog.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  if (src) {
    return (
      <Image
        src={src}
        alt={`${name} - SOLO Research`}
        width={600}
        height={600}
        sizes={sizes}
        priority={priority}
        className={cn("h-full w-full object-contain", className)}
      />
    );
  }

  const id = `v${uid}`;
  const title = name.toUpperCase();
  const nameSize = Math.min(28, 150 / (title.length * 0.6));
  const solution = label?.endsWith("ml");

  return (
    <svg viewBox="0 0 300 440" role="img" aria-label={`${name} - SOLO Research`} className={cn("h-full w-full", className)}>
      <defs>
        <linearGradient id={`${id}-cap`} x1="0" x2="1">
          <stop offset="0" stopColor="#0b1722" />
          <stop offset=".28" stopColor="#2e4b66" />
          <stop offset=".5" stopColor="#1a2f42" />
          <stop offset="1" stopColor="#070f17" />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x1="0" x2="1">
          <stop offset="0" stopColor="#5d6b78" />
          <stop offset=".22" stopColor="#eef3f7" />
          <stop offset=".45" stopColor="#8f9daa" />
          <stop offset=".75" stopColor="#e3eaf0" />
          <stop offset="1" stopColor="#4f5b66" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" x2="1">
          <stop offset="0" stopColor="#9fbfdc" stopOpacity=".75" />
          <stop offset=".1" stopColor="#e9f3fc" stopOpacity=".55" />
          <stop offset=".3" stopColor="#cfe2f3" stopOpacity=".22" />
          <stop offset=".7" stopColor="#cfe2f3" stopOpacity=".18" />
          <stop offset=".9" stopColor="#e9f3fc" stopOpacity=".5" />
          <stop offset="1" stopColor="#8fb0cf" stopOpacity=".8" />
        </linearGradient>
        <linearGradient id={`${id}-band`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#223d57" />
          <stop offset="1" stopColor="#12243a" />
        </linearGradient>
        <linearGradient id={`${id}-wrap`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".35" />
          <stop offset=".16" stopColor="#000" stopOpacity="0" />
          <stop offset=".62" stopColor="#fff" stopOpacity=".1" />
          <stop offset=".84" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".4" />
        </linearGradient>
        <radialGradient id={`${id}-shadow`}>
          <stop offset="0" stopColor="#1a2f42" stopOpacity=".35" />
          <stop offset="1" stopColor="#1a2f42" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-body`}>
          <rect x="62" y="142" width="176" height="276" rx="20" />
        </clipPath>
      </defs>

      {/* Floor shadow */}
      <ellipse cx="150" cy="424" rx="104" ry="10" fill={`url(#${id}-shadow)`} />

      {/* Glass: shoulders + body */}
      <path d="M112 116h76v10c0 6 50 8 50 36v236c0 11-9 20-20 20H82c-11 0-20-9-20-20V162c0-28 50-30 50-36Z" fill={`url(#${id}-glass)`} stroke="#b9d3ea" strokeOpacity=".9" strokeWidth="1.5" />
      {/* Contents: lyophilised cake or liquid */}
      <path d={solution ? "M64 300h172v98c0 11-9 20-20 20H84c-11 0-20-9-20-20Z" : "M64 382c34-7 138-7 172 0v16c0 11-9 20-20 20H84c-11 0-20-9-20-20Z"} fill={solution ? "#dcebf8" : "#fbfdff"} opacity={solution ? 0.55 : 0.95} />

      {/* Label */}
      <g clipPath={`url(#${id}-body)`}>
        <rect x="62" y="176" width="176" height="74" fill="#fbfdff" />
        <rect x="62" y="250" width="176" height="124" fill={`url(#${id}-band)`} />
        <rect x="62" y="248" width="176" height="3" fill="#b1d4f4" />
        <rect x="62" y="176" width="176" height="198" fill={`url(#${id}-wrap)`} />
      </g>
      <LogoMark x={78} y={188} scale={0.29} />
      <text x="150" y={292} textAnchor="middle" fill="#fff" fontFamily={LOGO_FONT} fontWeight="700" fontSize={nameSize} letterSpacing=".5">
        {title}
      </text>
      <line x1="92" x2="208" y1="304" y2="304" stroke="#b1d4f4" strokeOpacity=".35" />
      {label ? (
        <text x="150" y="330" textAnchor="middle" fill="#fff" fontFamily={LOGO_FONT} fontWeight="700" fontSize="20">
          {label}
        </text>
      ) : null}
      <text x="150" y="349" textAnchor="middle" fill="#dfedfa" fontFamily={LOGO_FONT} fontSize="10.5" letterSpacing=".4">
        {solution ? "STERILE · 0.9% BENZYL ALCOHOL" : "99% PURITY"}
      </text>
      <text x="150" y="364" textAnchor="middle" fill="#b1d4f4" fontFamily={LOGO_FONT} fontSize="8.5" letterSpacing="1.2">
        RESEARCH USE ONLY
      </text>

      {/* Glass highlights */}
      <rect x="72" y="150" width="7" height="258" rx="3.5" fill="#fff" opacity=".55" />
      <rect x="84" y="156" width="2.5" height="240" rx="1.2" fill="#fff" opacity=".35" />
      <rect x="220" y="160" width="4" height="236" rx="2" fill="#fff" opacity=".3" />

      {/* Crimp + cap */}
      <rect x="96" y="80" width="108" height="38" rx="5" fill={`url(#${id}-metal)`} />
      <path d="M96 99h108" stroke="#56626d" strokeOpacity=".45" />
      <rect x="88" y="16" width="124" height="68" rx="10" fill={`url(#${id}-cap)`} />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M${96 + i * 10} 24v54`} stroke="#fff" strokeOpacity={i % 2 ? 0.05 : 0.11} strokeWidth="3" />
      ))}
      <rect x="88" y="16" width="124" height="10" rx="5" fill="#fff" opacity=".1" />
    </svg>
  );
}
