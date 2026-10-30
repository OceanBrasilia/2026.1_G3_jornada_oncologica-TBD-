import { useEffect, type ReactNode } from "react";
import { evaluateCondition, type Condition } from "./conditionalEngine";

export interface ConditionalFieldProps {
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  showIf: Condition;
  /** Nomes dos campos que ficam dentro deste bloco — são limpos automaticamente quando o bloco fica escondido. */
  campos: string[];
  children: ReactNode;
  className?: string;
}

/**
 * Envolve um bloco de campos que só deve aparecer conforme a resposta de outro campo.
 * Quando escondido: os `campos` são limpos, não ficam obrigatórios e não aparecem
 * na tela (portanto não entram na validação nem na Ficha Consolidada).
 */
export function ConditionalField({ data, onChange, showIf, campos, children, className }: ConditionalFieldProps) {
  const visible = evaluateCondition(data, showIf);

  useEffect(() => {
    if (visible) return;
    campos.forEach((campo) => {
      const current = data[campo];
      const isEmpty = current === undefined || current === "" || (Array.isArray(current) && current.length === 0);
      if (!isEmpty) {
        onChange(campo, Array.isArray(current) ? [] : "");
      }
    });
    // Só precisa reagir a mudanças de visibilidade — os valores atuais são lidos do fechamento (closure) no momento da mudança.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  return className ? <div className={className}>{children}</div> : <>{children}</>;
}
