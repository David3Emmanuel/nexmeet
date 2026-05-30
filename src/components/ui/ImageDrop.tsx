'use client';

import { useRef, useState } from 'react';
import Icon from './Icon';

interface ImageDropProps {
  placeholder?: string;
  style?: React.CSSProperties;
}

export default function ImageDrop({ placeholder = "Drop flyer / logo", style }: ImageDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [over, setOver] = useState(false);

  const ingest = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => setSrc(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div
      onClick={() => !src && inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) ingest(f); }}
      style={{
        position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 8, cursor: src ? "default" : "pointer",
        border: `1.5px dashed ${over ? "var(--accent)" : "var(--card-edge)"}`,
        borderRadius: 22, background: over ? "color-mix(in srgb, var(--accent) 6%, var(--card))" : "var(--card)",
        overflow: "hidden", transition: "border-color .16s, background .16s",
        ...style,
      }}
    >
      {src ? (
        <>
          <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
          <button
            onClick={e => { e.stopPropagation(); setSrc(null); }}
            style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,.55)", color: "#fff", border: "none", borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}
          >
            Remove
          </button>
        </>
      ) : (
        <>
          <Icon name="download" size={28} />
          <span style={{ fontWeight: 500, fontSize: 14, color: "var(--ink-2)", textAlign: "center" }}>{placeholder}</span>
          <span style={{ fontSize: 12, color: "var(--ink-3)" }}>or <u>browse files</u></span>
        </>
      )}
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) ingest(f); e.target.value = ""; }} />
    </div>
  );
}
