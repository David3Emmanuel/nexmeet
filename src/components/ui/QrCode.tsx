'use client';

import QRCode from 'react-qr-code';

interface QrCodeProps {
  seed?: string;
  size?: number;
  color?: string;
}

export default function QrCode({ seed = "NEXMEET", size = 140, color = "var(--ink)" }: QrCodeProps) {
  // If the seed is already a full URL, use it directly. Otherwise construct the join link using the current origin.
  const host = typeof window !== 'undefined' ? window.location.origin : 'https://nexmeet.app';
  const value = seed.startsWith('http') ? seed : `${host}/e/${seed}`;
  
  return (
    <QRCode 
      value={value} 
      size={size} 
      fgColor={color} 
      bgColor="transparent" 
      level="M"
      style={{ display: "block" }}
    />
  );
}
