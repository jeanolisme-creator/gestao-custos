import React, { createContext, useContext, useState } from 'react';

export type SystemType = 'water' | 'energy' | 'fixed-line' | 'mobile';

export interface SystemConfig {
  id: SystemType;
  name: string;
  icon: string;
  color: string;
  unit: string;
  consumptionLabel: string;
  fields: SystemField[];
}

export interface SystemField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select';
  required?: boolean;
  options?: string[];
}

interface SystemContextType {
  currentSystem: SystemType;
  setCurrentSystem: (system: SystemType) => void;
  systemConfig: SystemConfig;
  allSystems: SystemConfig[];
}

const systemConfigs: Record<SystemType, SystemConfig> = {
  water: {
    id: 'water',
    name: 'Gestão de Água',
    icon: 'Droplets',
    color: 'blue',
    unit: 'm³',
    consumptionLabel: 'Consumo de Água',
    fields: [
      { name: 'cadastro', label: 'Cadastro', type: 'text', required: true },
      { name: 'nome_escola', label: 'Nome da Escola', type: 'text', required: true },
      { name: 'responsavel', label: 'Responsável', type: 'text' },
      { name: 'hidrometro', label: 'Hidrômetro', type: 'text' },
      { name: 'endereco_completo', label: 'Endereço Completo', type: 'text' },
      { name: 'mes_ano_referencia', label: 'Mês/Ano', type: 'text', required: true },
      { name: 'consumo_m3', label: 'Consumo (m³)', type: 'number' },
      { name: 'valor_gasto', label: 'Valor Gasto', type: 'number' },
      { name: 'valor_servicos', label: 'Valor Serviços', type: 'number' },
    ]
  },
  energy: {
    id: 'energy',
    name: 'Gestão de Energia',
    icon: 'Zap',
    color: 'yellow',
    unit: 'KWh',
    consumptionLabel: 'Consumo de Energia',
    fields: [
      { name: 'cadastro_cliente', label: 'Cadastro Cliente', type: 'text', required: true },
      { name: 'nome_escola', label: 'Nome da Escola', type: 'text', required: true },
      { name: 'relogio', label: 'Relógio', type: 'text' },
      { name: 'tipo_instalacao', label: 'Tipo de Instalação', type: 'select', options: ['BAIXA', 'MEDIA/ALTA'] },
      { name: 'demanda_kwh', label: 'Demanda (KWh)', type: 'number' },
      { name: 'unidade', label: 'Unidade', type: 'text' },
      { name: 'proprietario', label: 'Proprietário', type: 'text' },
      { name: 'endereco', label: 'Endereço', type: 'text' },
      { name: 'numero', label: 'Número', type: 'text' },
      { name: 'bairro', label: 'Bairro', type: 'text' },
      { name: 'macroregiao', label: 'Macrorregião', type: 'text' },
      { name: 'tipo_escola', label: 'Tipo Escola', type: 'text' },
      { name: 'mes_ano_referencia', label: 'Mês/Ano', type: 'text', required: true },
      { name: 'consumo_kwh', label: 'Consumo (KWh)', type: 'number' },
      { name: 'valor_gasto', label: 'Valor Gasto', type: 'number' },
      { name: 'valor_servicos', label: 'Valor Serviços', type: 'number' },
    ]
  },
  'fixed-line': {
    id: 'fixed-line',
    name: 'Gestão de Linha Fixa',
    icon: 'Phone',
    color: 'green',
    unit: 'min',
    consumptionLabel: 'Consumo de Linha',
    fields: [
      { name: 'cadastro_cliente', label: 'Cadastro Cliente', type: 'text', required: true },
      { name: 'nome_escola', label: 'Nome da Escola', type: 'text', required: true },
      { name: 'numero_linha', label: 'Número da Linha', type: 'text' },
      { name: 'proprietario', label: 'Proprietário', type: 'text' },
      { name: 'endereco', label: 'Endereço', type: 'text' },
      { name: 'numero', label: 'Número', type: 'text' },
      { name: 'bairro', label: 'Bairro', type: 'text' },
      { name: 'macroregiao', label: 'Macrorregião', type: 'text' },
      { name: 'tipo_escola', label: 'Tipo Escola', type: 'text' },
      { name: 'mes_ano_referencia', label: 'Mês/Ano', type: 'text', required: true },
      { name: 'valor_gasto', label: 'Valor Gasto', type: 'number' },
      { name: 'valor_servicos', label: 'Valor Serviços', type: 'number' },
    ]
  },
  mobile: {
    id: 'mobile',
    name: 'Gestão de Celulares',
    icon: 'Smartphone',
    color: 'purple',
    unit: 'MB',
    consumptionLabel: 'Consumo de Dados',
    fields: [
      { name: 'cadastro_cliente', label: 'Cadastro Cliente', type: 'text', required: true },
      { name: 'nome_escola', label: 'Nome da Escola', type: 'text', required: true },
      { name: 'numero_linha', label: 'Número da Linha', type: 'text' },
      { name: 'proprietario', label: 'Proprietário', type: 'text' },
      { name: 'endereco', label: 'Endereço', type: 'text' },
      { name: 'numero', label: 'Número', type: 'text' },
      { name: 'bairro', label: 'Bairro', type: 'text' },
      { name: 'macroregiao', label: 'Macrorregião', type: 'text' },
      { name: 'tipo_escola', label: 'Tipo Escola', type: 'text' },
      { name: 'mes_ano_referencia', label: 'Mês/Ano', type: 'text', required: true },
      { name: 'consumo_mb', label: 'Consumo (MB)', type: 'number' },
      { name: 'valor_gasto', label: 'Valor Gasto', type: 'number' },
      { name: 'valor_servicos', label: 'Valor Serviços', type: 'number' },
    ]
  }
};

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};

interface SystemProviderProps {
  children: React.ReactNode;
}

export const SystemProvider: React.FC<SystemProviderProps> = ({ children }) => {
  const [currentSystem, setCurrentSystem] = useState<SystemType>('water');

  const systemConfig = systemConfigs[currentSystem];
  const allSystems = Object.values(systemConfigs);

  return (
    <SystemContext.Provider value={{
      currentSystem,
      setCurrentSystem,
      systemConfig,
      allSystems
    }}>
      {children}
    </SystemContext.Provider>
  );
};