// Vector redraw of the SOLO Research logo (three honeycomb hexagons + wordmark),
// crisp at any size. Used on product vial labels.
const R = 50;

function hexPoints(cx: number, cy: number, r = R) {
  const h = (r * Math.sqrt(3)) / 2;
  return [
    [cx - r, cy],
    [cx - r / 2, cy - h],
    [cx + r / 2, cy - h],
    [cx + r, cy],
    [cx + r / 2, cy + h],
    [cx - r / 2, cy + h],
  ]
    .map((p) => p.join(","))
    .join(" ");
}

const cells = [
  { cx: 58, cy: 95, text: "S" },
  { cx: 145, cy: 45, text: "O" },
  { cx: 145, cy: 145, text: "LO" },
];

export const LOGO_FONT = "var(--font-label), 'Arial Narrow', Arial, sans-serif";

/** Renders inside a parent <svg>; occupies a 500×192 box at (x, y) scaled by `scale`. */
export function LogoMark({ x = 0, y = 0, scale = 1, color = "#1A2F42" }: { x?: number; y?: number; scale?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {cells.map((c) => (
        <g key={c.text}>
          <polygon points={hexPoints(c.cx, c.cy, R + 3)} fill="#fff" />
          <polygon points={hexPoints(c.cx, c.cy)} fill={color} />
          <text x={c.cx} y={c.cy + 19} textAnchor="middle" fill="#fff" fontFamily={LOGO_FONT} fontWeight="700" fontSize={c.text.length > 1 ? 50 : 56}>
            {c.text}
          </text>
        </g>
      ))}
      <text x="212" y="118" fill={color} fontFamily={LOGO_FONT} fontWeight="700" fontSize="64" letterSpacing="0.5">
        RESEARCH
      </text>
    </g>
  );
}
