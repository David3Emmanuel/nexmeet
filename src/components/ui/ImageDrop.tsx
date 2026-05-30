'use client';

import { useRef, useState } from 'react';
import Icon from './Icon';
import { uploadToCloudinary } from '@/lib/media';

interface ImageDropProps {
  placeholder?: string;
  style?: React.CSSProperties;
  value?: string | null;
  onChange?: (src: string | null) => void;
}


export default function ImageDrop({ placeholder = "Drop flyer / logo", style, value, onChange }: ImageDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalSrc, setInternalSrc] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);

  const src = value !== undefined ? value : internalSrc;
  const setSrc = (val: string | null) => {
    if (onChange) onChange(val);
    setInternalSrc(val);
  };

  const ingest = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setError(false);
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setSrc(url);
    } catch {
      setError(true);
      setTimeout(() => setError(false), 3000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      onClick={() => !src && !uploading && inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) ingest(f); }}
      style={{
        position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 8, cursor: src || uploading ? "default" : "pointer",
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
      ) : uploading ? (
        <>
          <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2.5px solid var(--card-edge)", borderTopColor: "var(--accent)", animation: "spin .7s linear infinite" }} />
          <span style={{ fontWeight: 500, fontSize: 14, color: "var(--ink-2)" }}>Uploading…</span>
        </>
      ) : (
        <>
          <Icon name="download" size={28} />
          <span style={{ fontWeight: 500, fontSize: 14, color: error ? "var(--error, #e53)" : "var(--ink-2)", textAlign: "center" }}>
            {error ? "Upload failed — try again" : placeholder}
          </span>
          {!error && <span style={{ fontSize: 12, color: "var(--ink-3)" }}>or <u>browse files</u></span>}
        </>
      )}
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) ingest(f); e.target.value = ""; }} />
    </div>
  );
}
