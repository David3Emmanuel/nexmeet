'use client';

import QRCode from 'react-qr-code';

interface QrCodeProps {
  seed?: string;
  size?: number;
  color?: string;
}

export default function QrCode({ seed = "NEXMEET", size = 140, color = "var(--ink)" }: QrCodeProps) {
  // If the seed is already a full URL, use it directly. Otherwise construct the join link.
  const value = seed.startsWith('http') ? seed : `https://nexmeet.app/e/${seed}`;
  
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
