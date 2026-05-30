'use client';

interface QrCodeProps {
  seed?: string;
  size?: number;
  color?: string;
}

export default function QrCode({ seed = "NEXMEET", size = 140, color = "var(--ink)" }: QrCodeProps) {
  const n = 21;
  const cells: [number, number][] = [];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) >>> 0;
  const rand = () => { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff; };
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const finder = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
      if (finder) continue;
      if (rand() > 0.52) cells.push([x, y]);
    }
  }
  const cs = size / n;

  const Finder = ({ x, y }: { x: number; y: number }) => (
    <g>
      <rect x={x * cs} y={y * cs} width={cs * 7} height={cs * 7} rx={cs * 1.4} fill={color} />
      <rect x={(x + 1) * cs} y={(y + 1) * cs} width={cs * 5} height={cs * 5} rx={cs} fill="var(--card)" />
      <rect x={(x + 2) * cs} y={(y + 2) * cs} width={cs * 3} height={cs * 3} rx={cs * .7} fill={color} />
    </g>
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      {cells.map(([x, y], i) => (
        <rect key={i} x={x * cs + cs * .12} y={y * cs + cs * .12} width={cs * .76} height={cs * .76} rx={cs * .25} fill={color} />
      ))}
      <Finder x={0} y={0} />
      <Finder x={n - 7} y={0} />
      <Finder x={0} y={n - 7} />
    </svg>
  );
}
