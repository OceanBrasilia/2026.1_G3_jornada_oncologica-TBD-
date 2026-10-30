import React, { useId } from "react";
import { X, AlertTriangle } from "lucide-react";

export interface InheritableProps {
  label: string;
  name: string;
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  inheritedData?: Record<string, any>;
  origins?: Record<string, string>;
  /** Aviso não bloqueante: a pergunta pode não fazer sentido na situação do paciente, mas continua editável — nunca é desabilitada. */
  conflictStatus?: {
    hint?: string;
    onDismiss?: () => void;
  };
}

const ConflictHint = ({ hint, onDismiss }: { hint?: string; onDismiss?: () => void }) => {
  if (!hint) return null;
  return (
    <div className="flex items-start gap-1.5 mb-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
      <AlertTriangle size={12} className="shrink-0 mt-0.5" />
      <span className="flex-1 leading-snug">{hint}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="font-bold underline shrink-0 hover:text-amber-900">Dispensar</button>
      )}
    </div>
  );
};

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
    <span className="inline-flex items-center text-[10px] text-[#2DB5A3] font-semibold bg-[#F0FBF9] px-2 py-0.5 rounded-full border border-[#2DB5A3]/20 whitespace-normal">
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
  const id = useId();

  if (isInheritedActive) {
    return (
      <div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
          <label htmlFor={id} className="block text-xs font-bold text-[#6B7A8D]">{label}</label>
          <OriginBadge origin={origin} />
          <SuppressButton onClick={() => onChange(`${name}_suppressed`, true)} />
        </div>
        <input
          id={id}
          type={type}
          readOnly
          value={inheritedValue}
          className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] cursor-not-allowed opacity-80"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
        <label htmlFor={id} className="block text-xs font-bold text-[#1A2332]">{label}</label>
      </div>
      <ConflictHint hint={conflictStatus?.hint} onDismiss={conflictStatus?.onDismiss} />
      <input
        id={id}
        type={type}
        name={name}
        value={data?.[name] ?? ""}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition bg-[#F9FBFE] text-[#1A2332]"
      />
    </div>
  );
};

export const InheritableTextarea = ({ label, name, placeholder = "", rows = 3, data, onChange, inheritedData, origins }: InheritableProps & { rows?: number, placeholder?: string }) => {
  const { inheritedValue, origin, isInheritedActive } = useInheritance(name, data, inheritedData, origins);
  const id = useId();

  if (isInheritedActive) {
    return (
      <div className="sm:col-span-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
          <label htmlFor={id} className="block text-xs font-bold text-[#6B7A8D]">{label}</label>
          <OriginBadge origin={origin} />
          <SuppressButton onClick={() => onChange(`${name}_suppressed`, true)} />
        </div>
        <textarea
          id={id}
          readOnly
          value={inheritedValue}
          rows={rows}
          className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] cursor-not-allowed opacity-80 resize-none mb-2"
        />
        <label htmlFor={`${id}-complemento`} className="block text-[10px] font-bold text-[#1A2332] mb-1 uppercase tracking-wider">Complemento / Anexo</label>
        <textarea
          id={`${id}-complemento`}
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
      <label htmlFor={id} className="block text-xs font-bold text-[#1A2332] mb-1">{label}</label>
      <textarea
        id={id}
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
  const id = useId();

  if (isInheritedActive) {
    return (
      <div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
          <label htmlFor={id} className="block text-xs font-bold text-[#6B7A8D]">{label}</label>
          <OriginBadge origin={origin} />
          <SuppressButton onClick={() => {
            onChange(`${name}_suppressed`, true);
            if (mapValue) onChange(name, inheritedValue);
          }} />
        </div>
        {subLabel && <div className="text-[10px] text-[#8A9EB9] font-normal leading-tight mb-1">{subLabel}</div>}
        <input
          id={id}
          type="text"
          readOnly
          value={inheritedValue}
          className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] cursor-not-allowed opacity-80"
        />
      </div>
    );
  }

  const value = data?.[name] || "";
  const isCustomOther = value && !options.includes(value);
  const showOtherInput = hasOther && (value === "Outro" || isCustomOther || Boolean(data?.[`${name}_isOther`] === "true") || Boolean(data?.[`${name}_outro`]));

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-[#1A2332] mb-1">
        {label}
        {subLabel && <div className="text-[10px] text-[#8A9EB9] font-normal leading-tight mt-0.5">{subLabel}</div>}
      </label>
      <select
        id={id}
        name={name}
        value={isCustomOther && hasOther ? "Outro" : value}
        onChange={(e) => {
          const val = e.target.value;
          onChange(name, val);
          if (val !== "Outro") {
            if (hasOther) {
              onChange(`${name}_isOther`, "false");
              if (data?.[`${name}_outro`]) onChange(`${name}_outro`, "");
            }
          } else {
            if (hasOther) onChange(`${name}_isOther`, "true");
          }
        }}
        className="w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-[#F9FBFE] text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
      >
        <option value="">Selecione...</option>
        {options.map((o: string) => (
          <option key={o} value={o}>{o}</option>
        ))}
        {hasOther && !options.includes("Outro") && <option value="Outro">Outro</option>}
      </select>
      
      {showOtherInput && (
        <input
          type="text"
          value={data?.[`${name}_outro`] ?? (isCustomOther ? value : "")}
          onChange={(e) => {
            const outroTexto = e.target.value;
            onChange(`${name}_outro`, outroTexto);
            if (value !== "Outro") onChange(name, "Outro");
          }}
          placeholder="Especifique..."
          aria-label={`${label}: especifique`}
          className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#D5E6F3] bg-white text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
        />
      )}
    </div>
  );
};

export const InheritableRadioPills = ({ label, name, options, data, onChange, inheritedData, origins, stacked = false, block = false, subLabel, hasOther = false }: InheritableProps & { options: string[], stacked?: boolean, block?: boolean, subLabel?: string, hasOther?: boolean }) => {
  const { inheritedValue, origin, isInheritedActive } = useInheritance(name, data, inheritedData, origins);
  const labelId = useId();

  const value = isInheritedActive ? inheritedValue : (data?.[name] || "");
  const showOtherInput = hasOther && (value === "Outro" || Boolean(data?.[`${name}_outro`]));

  return (
    <div role="group" aria-labelledby={label ? labelId : undefined} aria-label={label ? undefined : name}>
      {label && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
          <span id={labelId} className={`block text-xs font-bold ${isInheritedActive ? 'text-[#6B7A8D]' : 'text-[#1A2332]'}`}>{label}</span>
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
              aria-pressed={isSelected}
              aria-disabled={isInheritedActive || undefined}
              onClick={() => {
                if (!isInheritedActive) {
                  onChange(name, opt);
                  if (opt !== "Outro" && data?.[`${name}_outro`]) {
                    onChange(`${name}_outro`, "");
                  }
                }
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
      {showOtherInput && (
        <div className="mt-2">
          <input
            type="text"
            value={data?.[`${name}_outro`] ?? ""}
            onChange={(e) => onChange(`${name}_outro`, e.target.value)}
            placeholder="Especifique..."
            aria-label={`${label}: especifique`}
            className="w-full px-3 py-2 rounded-xl border border-[#D5E6F3] bg-white text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
          />
        </div>
      )}
    </div>
  );
};

export const InheritableRadioGroup = ({ label, name, options, data, onChange, inheritedData, origins }: InheritableProps & { options: string[] }) => {
  const { inheritedValue, origin, isInheritedActive } = useInheritance(name, data, inheritedData, origins);
  const labelId = useId();

  const value = isInheritedActive ? inheritedValue : (data?.[name] || "");

  return (
    <div role="radiogroup" aria-labelledby={labelId}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
        <span id={labelId} className={`block text-xs font-bold ${isInheritedActive ? 'text-[#6B7A8D]' : 'text-[#1A2332]'}`}>{label}</span>
        {isInheritedActive && (
          <>
            <OriginBadge origin={origin} />
            <SuppressButton onClick={() => onChange(`${name}_suppressed`, true)} />
          </>
        )}
      </div>
      <div className="flex flex-wrap gap-4">
        {options.map((opt: string, idx: number) => {
          const optId = `${labelId}-radio-${idx}`;
          return (
            <label key={opt} htmlFor={optId} className={`flex items-center gap-2 ${isInheritedActive ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}>
              <input
                id={optId}
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
          );
        })}
      </div>
    </div>
  );
};

export const InheritableCheckboxGroup = ({ label, name, options, data, onChange, inheritedData, origins, separator = ", ", inline = false, direction, hasOther = false, subLabel }: InheritableProps & { options: string[], separator?: string, inline?: boolean, direction?: "col" | "row" | "grid", hasOther?: boolean, subLabel?: string }) => {
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
  const labelId = useId();

  const handleToggle = (opt: string) => {
    if (isInheritedActive) return;
    let newSelected;
    if (selectedOptions.includes(opt)) {
      newSelected = selectedOptions.filter((item: string) => item !== opt);
      if (opt === "Outro" && data?.[`${name}_outro`]) {
        onChange(`${name}_outro`, "");
      }
    } else {
      newSelected = [...selectedOptions, opt];
    }
    // Return array, not string, since that's what forms expect
    onChange(name, newSelected);
  };

  const layoutClass = direction === "grid"
    ? "grid grid-cols-1 sm:grid-cols-2 gap-2.5"
    : (direction === "row" || inline)
      ? "flex flex-wrap gap-4 items-center"
      : "flex flex-col gap-2.5";

  const showOtherInput = (hasOther || options.includes("Outro")) && (selectedOptions.includes("Outro") || Boolean(data?.[`${name}_outro`]));

  return (
    <div role="group" aria-labelledby={label ? labelId : undefined} aria-label={label ? undefined : name}>
      {label && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
          <span id={labelId} className={`block text-xs font-bold ${isInheritedActive ? 'text-[#6B7A8D]' : 'text-[#1A2332]'}`}>{label}</span>
          {isInheritedActive && (
            <>
              <OriginBadge origin={origin} />
              <SuppressButton onClick={() => onChange(`${name}_suppressed`, true)} />
            </>
          )}
        </div>
      )}
      {subLabel && <div className="text-[10px] text-[#8A9EB9] font-normal leading-tight mb-2 -mt-1">{subLabel}</div>}
      <div className={layoutClass}>
        {options.map((opt: string, idx: number) => {
          const optId = `${labelId}-chk-${idx}`;
          const isSelected = selectedOptions.includes(opt);
          return (
            <label key={opt} htmlFor={optId} className={`relative flex items-start gap-2.5 py-1 ${isInheritedActive ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}>
              <input
                id={optId}
                type="checkbox"
                className="sr-only peer"
                checked={isSelected}
                disabled={isInheritedActive}
                onChange={() => handleToggle(opt)}
              />
              <div aria-hidden="true" className={`w-4 h-4 mt-0.5 rounded border shrink-0 flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#1B6CA8] peer-focus-visible:ring-offset-1 ${
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
              <span className={`text-sm leading-snug break-words flex-1 ${isInheritedActive ? "text-[#6B7A8D]" : "text-[#1A2332]"}`}>{opt}</span>
            </label>
          );
        })}
      </div>
      {showOtherInput && (
        <div className="mt-2.5">
          <input
            type="text"
            value={data?.[`${name}_outro`] ?? ""}
            onChange={(e) => onChange(`${name}_outro`, e.target.value)}
            placeholder="Especifique..."
            aria-label={`${label}: especifique`}
            className="w-full px-3 py-2 rounded-xl border border-[#D5E6F3] bg-white text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B6CA8]/20 focus:border-[#1B6CA8] transition"
          />
        </div>
      )}
    </div>
  );
};
