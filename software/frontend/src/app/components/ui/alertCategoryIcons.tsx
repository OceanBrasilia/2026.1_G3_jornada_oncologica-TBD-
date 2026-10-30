import React from "react";

export interface AlertIconProps {
  size?: number | string;
  strokeWidth?: number | string;
  className?: string;
}

/**
 * Ícones próprios para categorias de alerta sem um equivalente fiel no
 * Lucide (biblioteca usada no resto do sistema) — pessoa dentro de um
 * anel de pontos (Acessibilidade/Comunicação) e bolsa de soro
 * (Dispositivos), para bater com a referência visual aprovada.
 */
export function AccessibilityNetworkIcon({ size = 24, strokeWidth = 2, className }: AlertIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12.5" r="9.5" />
      <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none" />
      <circle cx="21" cy="12.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="22" r="1" fill="currentColor" stroke="none" />
      <circle cx="3" cy="12.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7" r="1.6" />
      <line x1="12" y1="8.8" x2="12" y2="14" />
      <line x1="7.8" y1="10.3" x2="16.2" y2="10.3" />
      <line x1="12" y1="14" x2="8.3" y2="18.5" />
      <line x1="12" y1="14" x2="15.7" y2="18.5" />
    </svg>
  );
}

export function IvBagIcon({ size = 24, strokeWidth = 2, className }: AlertIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9.5 2h5" />
      <path d="M12 2v2" />
      <path d="M7.2 4h9.6l-1.15 10.3a2 2 0 0 1-2 1.7h-3.3a2 2 0 0 1-2-1.7L7.2 4Z" />
      <path d="M8.4 9h7.2" />
      <path d="M12 16v5" />
      <circle cx="12" cy="21.6" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
