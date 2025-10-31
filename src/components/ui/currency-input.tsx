import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: string | number;
  onValueChange?: (value: string, numericValue: number) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    const formatCurrency = (val: string): string => {
      // Remove tudo que não é dígito
      const numbers = val.replace(/\D/g, "");

      // Converte para número e divide por 100 para ter os centavos
      const amount = Number(numbers) / 100;

      // Formata como moeda brasileira
      return amount.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    };

    const parseCurrency = (val: string): number => {
      // Remove o símbolo da moeda, espaços e converte formato BR para US
      const numbers = val
        .replace(/[R$\s]/g, "") // Remove R$ e espaços
        .replace(/\./g, "")      // Remove pontos (separadores de milhar)
        .replace(",", ".");      // Substitui vírgula por ponto (decimal)
      return parseFloat(numbers) || 0;
    };

    // Formata o valor inicial
    const formattedValue = React.useMemo(() => {
      if (value === undefined || value === null || value === "") return "";
      
      if (typeof value === "number") {
        return value.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
      }
      
      // Se já estiver formatado, retorna
      if (value.toString().includes("R$")) return value.toString();
      
      // Se for string numérica, formata
      return formatCurrency(value.toString());
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCurrency(e.target.value);
      const numeric = parseCurrency(formatted);
      
      if (onValueChange) {
        onValueChange(formatted, numeric);
      }
    };

    return (
      <Input
        type="text"
        inputMode="numeric"
        className={cn(className)}
        value={formattedValue}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
