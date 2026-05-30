'use client';

import StatusBar from '@/components/ui/StatusBar';

interface PhoneShellProps {
  children: React.ReactNode;
  darkStatus?: boolean;
}

export default function PhoneShell({ children, darkStatus = false }: PhoneShellProps) {
  return (
    <div className="phone-wrap">
      <div className="phone">
        <div className="phone-screen">
          <div className="notch" />
          <StatusBar dark={darkStatus} />
          <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
