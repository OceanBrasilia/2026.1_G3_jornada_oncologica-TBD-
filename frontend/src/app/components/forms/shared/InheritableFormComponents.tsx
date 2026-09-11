import React from "react";
import { X } from "lucide-react";

export interface InheritableProps {
  label: string;
  name: string;
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  inheritedData?: Record<string, any>;
  origins?: Record<string, string>;
  conflictStatus?: {
    disabled: boolean;
    placeholder?: string;
    canIgnore?: boolean;
    onIgnore?: () => void;
  };
}

// Helpers
const useInheritance = (name: string, data: Record<string, any>, inheritedData?: Record<string, any>, origins?: Record<string, string>, sourceName?: string) => {
  const sourceKey = sourceName ?? name;
  const isSuppressed = data?.[`${name}_suppressed`] === true;
  const inheritedValue = inheritedData?.[sourceKey];
  const origin = origins?.[sourceKey];
  const isInheritedActive = inheritedValue !== undefined && inheritedValue !== "" && !isSuppressed;

  return { isSuppressed, inheritedValue, origin, isInheritedActive };
};

const OriginBadge = ({ origin }: { origin?: string }) => {
  if (!origin) return null;
  return (
    <span className="inline-flex items-center text-[10px] text-[#2DB5A3] font-semibold bg-[#F0FBF9] px-2 py-0.5 rounded-full border border-[#2DB5A3]/20 whitespace-nowrap">
      ↩ {origin}
    </span>
  );
};

const SuppressButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1 text-[10px] font-bold text-[#D97706] hover:bg-amber-50 px-2 py-1 rounded-full transition-colors border border-transparent hover:border-amber-200"
    title="Ignorar/Suprimir este dado neste atendimento"
  >
    <X size={12} /> Ignorar
  </button>
);

export const InheritableInput = ({ label, name, placeholder = "", type = "text", data, onChange, inheritedData, origins, conflictStatus }: InheritableProps & { type?: string, placeholder?: string }) => {
  const { inheritedValue, origin, isInheritedActive } = useInheritance(name, data, inheritedData, origins);

  if (isInheritedActive) {
    return (
      <div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
          <label className="block text-xs font-bold text-[#6B7A8D]">{label}</label>
          <OriginBadge origin={origin} />
          <SuppressButton onClick={() => onChange(`${name}_suppressed`, true)} />
        </div>
        <input
          type={type}
          readOnly
          value={inheritedValue}
          className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] cursor-not-allowed opacity-80"
        />
      </div>
    );
  }

  const actualPlaceholder = conflictStatus?.disabled ? conflictStatus.placeholder : placeholder;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
        <label className={`block text-xs font-bold ${conflictStatus?.disabled ? 'text-[#8A9EB9]' : 'text-[#1A2332]'}`}>{label}</label>
        {conflictStatus?.disabled && conflictStatus?.canIgnore && (
          <button
            type="button"
            onClick={conflictStatus.onIgnore}
            className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-2 py-0.5 rounded-full transition-colors"
          >
            Ignorar Aviso
          </button>
        )}
      </div>
      <input
        type={type}
        name={name}
        value={data?.[name] ?? ""}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={actualPlaceholder}
        disabled={conflictStatus?.disabled}
        className={`w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition ${
          conflictStatus?.disabled 
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed placeholder:text-gray-500' 
            : 'bg-[#F9FBFE] text-[#1A2332]'
        }`}
      />
    </div>
  );
};

export const InheritableTextarea = ({ label, name, placeholder = "", rows = 3, data, onChange, inheritedData, origins }: InheritableProps & { rows?: number, placeholder?: string }) => {
  const { inheritedValue, origin, isInheritedActive } = useInheritance(name, data, inheritedData, origins);

  if (isInheritedActive) {
    return (
      <div className="sm:col-span-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
          <label className="block text-xs font-bold text-[#6B7A8D]">{label}</label>
          <OriginBadge origin={origin} />
          <SuppressButton onClick={() => onChange(`${name}_suppressed`, true)} />
        </div>
        <textarea
          readOnly
          value={inheritedValue}
          rows={rows}
          className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] cursor-not-allowed opacity-80 resize-none mb-2"
        />
        <label className="block text-[10px] font-bold text-[#1A2332] mb-1 uppercase tracking-wider">Complemento / Anexo</label>
        <textarea
          name={`${name}_append`}
          value={data?.[`${name}_append`] ?? ""}
          onChange={(e) => onChange(`${name}_append`, e.target.value)}
          placeholder="Adicione informações complementares..."
          rows={2}
          className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition resize-none"
        />
      </div>
    );
  }

  return (
    <div className="sm:col-span-2">
      <label className="block text-xs font-bold text-[#1A2332] mb-1">{label}</label>
      <textarea
        name={name}
        value={data?.[name] ?? ""}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition resize-none"
      />
    </div>
  );
};

export const InheritableSelect = ({ label, name, options, data, onChange, inheritedData, origins, hasOther = false, subLabel, sourceName, mapValue }: InheritableProps & { options: string[], hasOther?: boolean, subLabel?: string, sourceName?: string, mapValue?: (value: string) => string }) => {
  const { inheritedValue: rawInheritedValue, origin, isInheritedActive } = useInheritance(name, data, inheritedData, origins, sourceName);
  const inheritedValue = isInheritedActive && mapValue ? mapValue(rawInheritedValue) : rawInheritedValue;

  if (isInheritedActive) {
    return (
      <div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
          <label className="block text-xs font-bold text-[#6B7A8D]">{label}</label>
          <OriginBadge origin={origin} />
          <SuppressButton onClick={() => {
            onChange(`${name}_suppressed`, true);
            if (mapValue) onChange(name, inheritedValue);
          }} />
        </div>
        {subLabel && <div className="text-[10px] text-[#8A9EB9] font-normal leading-tight mb-1">{subLabel}</div>}
        <input
          type="text"
          readOnly
          value={inheritedValue}
          className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] cursor-not-allowed opacity-80"
        />
      </div>
    );
  }

  const value = data?.[name] || "";
  const isOther = value && !options.includes(value);

  return (
    <div>
      <label className="block text-xs font-bold text-[#1A2332] mb-1">
        {label}
        {subLabel && <div className="text-[10px] text-[#8A9EB9] font-normal leading-tight mt-0.5">{subLabel}</div>}
      </label>
      <select
        name={name}
        value={isOther && hasOther ? "Outro" : value}
        onChange={(e) => {
          if (e.target.value !== "Outro") {
            onChange(name, e.target.value);
            if (hasOther) onChange(`${name}_isOther`, "false");
          } else {
            onChange(name, "");
            if (hasOther) onChange(`${name}_isOther`, "true");
          }
        }}
        className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
      >
        <option value="">Selecione...</option>
        {options.map((o: string) => (
          <option key={o} value={o}>{o}</option>
        ))}
        {hasOther && <option value="Outro">Outro</option>}
      </select>
      
      {hasOther && (isOther || data?.[`${name}_isOther`] === "true") && (
        <input
          type="text"
          value={isOther ? value : ""}
          onChange={(e) => {
            onChange(name, e.target.value);
            onChange(`${name}_isOther`, "false");
          }}
          placeholder="Especifique..."
          className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-white text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
        />
      )}
    </div>
  );
};

export const InheritableRadioPills = ({ label, name, options, data, onChange, inheritedData, origins, stacked = false, block = false, subLabel }: InheritableProps & { options: string[], stacked?: boolean, block?: boolean, subLabel?: string }) => {
  const { inheritedValue, origin, isInheritedActive } = useInheritance(name, data, inheritedData, origins);

  const value = isInheritedActive ? inheritedValue : (data?.[name] || "");

  return (
    <div>
      {label && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
          <label className={`block text-xs font-bold ${isInheritedActive ? 'text-[#6B7A8D]' : 'text-[#1A2332]'}`}>{label}</label>
          {isInheritedActive && (
            <>
              <OriginBadge origin={origin} />
              <SuppressButton onClick={() => onChange(`${name}_suppressed`, true)} />
            </>
          )}
        </div>
      )}
      {subLabel && <div className="text-[10px] text-[#8A9EB9] font-normal leading-tight mb-2 -mt-1">{subLabel}</div>}
      <div className={`flex ${stacked ? 'flex-col gap-2' : 'flex-wrap gap-2'}`}>
        {options.map((opt: string) => {
          const isSelected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => {
                if (!isInheritedActive) onChange(name, opt);
              }}
              className={`px-4 py-1.5 text-sm font-semibold transition-colors border ${block ? 'w-full text-left flex' : ''} ${!block && !stacked ? 'rounded-full' : 'rounded-xl'} ${
                isSelected 
                  ? (isInheritedActive ? "bg-[#2DB5A3] text-white border-[#2DB5A3] cursor-default opacity-90" : "bg-[#1B6CA8] text-white border-[#1B6CA8]") 
                  : (isInheritedActive ? "bg-white text-[#9AAABB] border-[#EEF2F7] cursor-not-allowed opacity-50" : "bg-white text-[#6B7A8D] border-[#D5E6F3] hover:border-[#1B6CA8] hover:text-[#1B6CA8]")
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const InheritableRadioGroup = ({ label, name, options, data, onChange, inheritedData, origins }: InheritableProps & { options: string[] }) => {
  const { inheritedValue, origin, isInheritedActive } = useInheritance(name, data, inheritedData, origins);

  const value = isInheritedActive ? inheritedValue : (data?.[name] || "");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
        <label className={`block text-xs font-bold ${isInheritedActive ? 'text-[#6B7A8D]' : 'text-[#1A2332]'}`}>{label}</label>
        {isInheritedActive && (
          <>
            <OriginBadge origin={origin} />
            <SuppressButton onClick={() => onChange(`${name}_suppressed`, true)} />
          </>
        )}
      </div>
      <div className="flex flex-wrap gap-4">
        {options.map((opt: string) => (
          <label key={opt} className={`flex items-center gap-2 ${isInheritedActive ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}>
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={(e) => {
                if (!isInheritedActive) onChange(name, e.target.value);
              }}
              disabled={isInheritedActive}
              className={`w-4 h-4 text-[#1B6CA8] ${isInheritedActive && value === opt ? "text-[#2DB5A3]" : ""} focus:ring-[#1B6CA8]`}
            />
            <span className={`text-sm ${isInheritedActive ? "text-[#6B7A8D]" : "text-[#1A2332]"}`}>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export const InheritableCheckboxGroup = ({ label, name, options, data, onChange, inheritedData, origins, separator = ", ", inline = false }: InheritableProps & { options: string[], separator?: string, inline?: boolean }) => {
  const { inheritedValue, origin, isInheritedActive } = useInheritance(name, data, inheritedData, origins);

  const getArrayValue = (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === "string") return val.split(separator);
    return [];
  };

  const selectedOptions = isInheritedActive
    ? getArrayValue(inheritedValue)
    : getArrayValue(data?.[name]);

  const handleToggle = (opt: string) => {
    if (isInheritedActive) return;
    let newSelected;
    if (selectedOptions.includes(opt)) {
      newSelected = selectedOptions.filter((item: string) => item !== opt);
    } else {
      newSelected = [...selectedOptions, opt];
    }
    // Return array, not string, since that's what forms expect
    onChange(name, newSelected);
  };

  return (
    <div>
      {label && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
          <label className={`block text-xs font-bold ${isInheritedActive ? 'text-[#6B7A8D]' : 'text-[#1A2332]'}`}>{label}</label>
          {isInheritedActive && (
            <>
              <OriginBadge origin={origin} />
              <SuppressButton onClick={() => onChange(`${name}_suppressed`, true)} />
            </>
          )}
        </div>
      )}
      <div className={`flex ${inline ? 'flex-wrap gap-4 items-center' : 'flex-col gap-2'}`}>
        {options.map((opt: string) => {
          const isSelected = selectedOptions.includes(opt);
          return (
            <div key={opt} className={`flex items-start gap-2 ${isInheritedActive ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`} onClick={() => handleToggle(opt)}>
              <div className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center transition-colors ${
                isSelected 
                  ? (isInheritedActive ? "bg-[#2DB5A3] border-[#2DB5A3]" : "bg-[#1B6CA8] border-[#1B6CA8]") 
                  : (isInheritedActive ? "border-[#EEF2F7] bg-white opacity-50" : "border-[#D5E6F3] bg-white")
              }`}>
                {isSelected && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className={`text-sm leading-snug ${isInheritedActive ? "text-[#6B7A8D]" : "text-[#1A2332]"}`}>{opt}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
