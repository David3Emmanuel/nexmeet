'use client';

import { initials } from '@/lib/data';

interface AvatarProps {
  name: string;
  color?: string;
  size?: number;
  square?: boolean;
  src?: string;
  style?: React.CSSProperties;
}

export default function Avatar({ name, color, size = 46, square = false, src, style }: AvatarProps) {
  return (
    <div
      className={"avatar" + (square ? " sq" : "")}
      style={{ width: size, height: size, background: color || "var(--ink)", fontSize: size * 0.36, ...style }}
    >
      {src
        ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : initials(name)
      }
    </div>
  );
}
