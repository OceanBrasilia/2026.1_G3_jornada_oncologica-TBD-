import React, { useState, useRef, useEffect } from 'react';
import {
  Stethoscope,
  Users,
  AlertTriangle,
  Frown,
  X
} from 'lucide-react';
import { AccessibilityNetworkIcon, IvBagIcon } from './alertCategoryIcons';
import { AlertCategory, PatientAlert } from '../../types/alerts';

interface AlertBadgeProps {
  category: AlertCategory;
  /** Todos os alertas deste eixo (um chip por eixo, Nota Técnica). */
  alerts: PatientAlert[];
  className?: string;
}

const badgeConfig = {
  [AlertCategory.CLINICAL_RISK]: {
    bgColor: 'bg-emerald-400',
    icon: Stethoscope,
    tooltip: 'Risco Clínico ou Funcional'
  },
  [AlertCategory.ACCESSIBILITY]: {
    bgColor: 'bg-purple-300',
    icon: AccessibilityNetworkIcon,
    tooltip: 'Acessibilidade/Comunicação'
  },
  [AlertCategory.DEVICE_USAGE]: {
    bgColor: 'bg-blue-400',
    icon: IvBagIcon,
    tooltip: 'Uso de Dispositivos'
  },
  [AlertCategory.PSYCHOSOCIAL_RISK]: {
    bgColor: 'bg-yellow-400',
    icon: Users,
    tooltip: 'Risco Psicossocial'
  },
  [AlertCategory.ALLERGY]: {
    bgColor: 'bg-red-500',
    icon: AlertTriangle,
    tooltip: 'Alergias/Reações Adversas'
  },
  [AlertCategory.SEVERE_SYMPTOMS]: {
    bgColor: 'bg-orange-500',
    icon: Frown,
    tooltip: 'Dor/Sintomas Intensos'
  },
};

export const AlertBadge: React.FC<AlertBadgeProps> = ({ category, alerts, className = '' }) => {
  const config = badgeConfig[category];
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  
  if (!config) return null;

  const Icon = config.icon;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative flex items-center justify-center" ref={popupRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={alerts.length === 1 ? `${config.tooltip}: ${alerts[0].title}` : `${config.tooltip}: ${alerts.length} alertas`}
        aria-expanded={isOpen}
        className={`relative flex items-center justify-center w-6 h-6 rounded-full ${config.bgColor} text-black shrink-0 ${className} shadow-sm border border-black/5 hover:scale-110 transition-transform`}
      >
        <Icon size={13} strokeWidth={2.5} />
        {alerts.length > 1 && (
          <span aria-hidden="true" className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-[#1A2332] text-white text-[9px] font-bold flex items-center justify-center border border-white">
            {alerts.length}
          </span>
        )}
      </button>
      
      {/* Click Popup */}
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-3 bg-[#1A2332] text-white rounded-xl shadow-xl z-50 w-max max-w-[240px] text-left animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="text-xs font-bold">{config.tooltip}</span>
            <button onClick={() => setIsOpen(false)} aria-label="Fechar" className="text-gray-400 hover:text-white transition">
              <X size={12} />
            </button>
          </div>
          {alerts.length === 1 ? (
            alerts[0].description && (
              <p className="text-[11px] text-gray-300 leading-tight whitespace-pre-wrap">{alerts[0].description}</p>
            )
          ) : (
            <ul className="space-y-1 list-disc pl-3.5">
              {alerts.map(a => (
                <li key={a.id} className="text-[11px] text-gray-300 leading-tight whitespace-pre-wrap">{a.description || a.title}</li>
              ))}
            </ul>
          )}
          {/* Arrow */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-px border-4 border-transparent border-b-[#1A2332]" />
        </div>
      )}
    </div>
  );
};
