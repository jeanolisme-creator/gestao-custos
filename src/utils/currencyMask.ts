export const formatCurrency = (value: string): string => {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');
  
  // Converte para número e divide por 100 para ter os centavos
  const amount = Number(numbers) / 100;
  
  // Formata como moeda brasileira
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const parseCurrency = (value: string): number => {
  // Remove o símbolo da moeda e espaços
  const numbers = value.replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(numbers) || 0;
};

export const handleCurrencyInput = (
  e: React.ChangeEvent<HTMLInputElement>,
  setValue: (value: string) => void
) => {
  const formatted = formatCurrency(e.target.value);
  setValue(formatted);
};
