import React, { createContext, useContext, useState } from 'react';

export type SystemType = 'water' | 'energy' | 'fixed-line' | 'hr' | 'supplies' | 'school-demand' | 'outsourced' | 'contracts';

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
      { name: 'macroregiao', label: 'Macrorregião', type: 'select', options: ['HB', 'Vila Toninho', 'Schmidt', 'Represa', 'Bosque', 'Talhado', 'Central', 'Cidade da Criança', 'Pinheirinho', 'Ceu'] },
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
      { name: 'macroregiao', label: 'Macrorregião', type: 'select', options: ['HB', 'Vila Toninho', 'Schmidt', 'Represa', 'Bosque', 'Talhado', 'Central', 'Cidade da Criança', 'Pinheirinho', 'Ceu'] },
      { name: 'tipo_escola', label: 'Tipo Escola', type: 'text' },
      { name: 'mes_ano_referencia', label: 'Mês/Ano', type: 'text', required: true },
      { name: 'valor_gasto', label: 'Valor Gasto', type: 'number' },
      { name: 'valor_servicos', label: 'Valor Serviços', type: 'number' },
    ]
  },
  hr: {
    id: 'hr',
    name: 'Gestão de RH',
    icon: 'Users',
    color: 'orange',
    unit: 'profissionais',
    consumptionLabel: 'Recursos Humanos',
    fields: [
      { name: 'nome_completo', label: 'Nome Completo', type: 'text', required: true },
      { name: 'cpf', label: 'CPF', type: 'text', required: true },
      { name: 'matricula', label: 'Número de Matrícula', type: 'text', required: true },
      { name: 'cargo', label: 'Cargo', type: 'select', required: true, options: ['Professor', 'Diretor', 'Coordenador', 'Agente Administrativo', 'Inspetor de Alunos', 'Merendeira', 'Profissional Readaptado', 'Assistente de Direção'] },
      { name: 'escola_lotacao', label: 'Escola/Lotação', type: 'text', required: true },
      { name: 'salario_base', label: 'Salário Base', type: 'number', required: true },
      { name: 'data_admissao', label: 'Data de Admissão', type: 'text', required: true },
      { name: 'jornada_trabalho', label: 'Jornada de Trabalho (horas)', type: 'number' },
      { name: 'regime_trabalho', label: 'Regime de Trabalho', type: 'select', options: ['Estatutário', 'CLT', 'Temporário'] },
      { name: 'formacao_academica', label: 'Formação Acadêmica', type: 'text' },
      { name: 'turno_trabalho', label: 'Turno de Trabalho', type: 'select', options: ['Matutino', 'Vespertino', 'Noturno', 'Integral'] },
    ]
  },
  supplies: {
    id: 'supplies',
    name: 'Gestão de Suprimentos',
    icon: 'Package',
    color: 'teal',
    unit: 'itens',
    consumptionLabel: 'Suprimentos',
    fields: [
      { name: 'nome_escola', label: 'Nome da Escola', type: 'text', required: true },
      { name: 'categoria', label: 'Categoria', type: 'select', required: true, options: ['Mobiliário Geral', 'Tecnologia e Eletrônicos', 'Material de Escritório e Didático', 'Materiais Pedagógicos e Educativos', 'Equipamentos para Áreas Externas', 'Equipamentos para Cozinha/Refeitório', 'Materiais de Limpeza', 'Itens de Segurança', 'Itens de Conforto'] },
      { name: 'item', label: 'Item/Produto', type: 'text', required: true },
      { name: 'quantidade', label: 'Quantidade', type: 'number', required: true },
      { name: 'valor_unitario', label: 'Valor Unitário', type: 'number', required: true },
      { name: 'valor_total', label: 'Valor Total', type: 'number', required: true },
      { name: 'nivel_ensino', label: 'Nível de Ensino', type: 'select', required: true, options: ['Creche (0-3 anos)', 'Pré-escola (4-5 anos)', 'Anos Iniciais (6-10 anos)', 'Anos Finais (11-14 anos)', 'Todos os Níveis'] },
      { name: 'fornecedor', label: 'Fornecedor', type: 'text' },
      { name: 'data_aquisicao', label: 'Data de Aquisição', type: 'text' },
      { name: 'estado_conservacao', label: 'Estado de Conservação', type: 'select', options: ['Novo', 'Bom', 'Regular', 'Ruim', 'Descarte'] },
    ]
  },
  'school-demand': {
    id: 'school-demand',
    name: 'Gestão de Demanda Escolar',
    icon: 'GraduationCap',
    color: 'indigo',
    unit: 'alunos',
    consumptionLabel: 'Demanda Escolar',
    fields: [
      { name: 'nome_escola', label: 'Nome da Escola', type: 'text', required: true },
      { name: 'endereco_completo', label: 'Endereço Completo', type: 'text' },
      { name: 'numero', label: 'Número', type: 'text' },
      { name: 'bairro', label: 'Bairro', type: 'text' },
      { name: 'macroregiao', label: 'Macrorregião', type: 'select', options: ['HB', 'Vila Toninho', 'Schmidt', 'Represa', 'Bosque', 'Talhado', 'Central', 'Cidade da Criança', 'Pinheirinho', 'Ceu'] },
      { name: 'telefone', label: 'Telefone', type: 'text' },
      { name: 'email', label: 'E-mail', type: 'text' },
      { name: 'alunos_creche', label: 'Alunos Creche (0-3 anos)', type: 'number' },
      { name: 'alunos_infantil', label: 'Alunos Infantil/Pré-escola (4-5 anos)', type: 'number' },
      { name: 'alunos_fundamental_i', label: 'Alunos Fundamental I (6-10 anos)', type: 'number' },
      { name: 'alunos_fundamental_ii', label: 'Alunos Fundamental II (11-14 anos)', type: 'number' },
      { name: 'alunos_por_turma', label: 'Alunos por Turma', type: 'number' },
    ]
  },
  'outsourced': {
    id: 'outsourced',
    name: 'Gestão de Terceirizados',
    icon: 'UserCog',
    color: 'cyan',
    unit: 'funcionários',
    consumptionLabel: 'Terceirizados',
    fields: [
      { name: 'empresa', label: 'Empresa', type: 'select', required: true, options: ['Produserv', 'GF', 'Eficience', 'Assej', 'Outro'] },
      { name: 'local_trabalho', label: 'Local de Trabalho', type: 'text', required: true },
      { name: 'cargo', label: 'Cargo', type: 'select', required: true, options: ['Aux. Apoio Escolar', 'Apoio Administrativo', 'Porteiro', 'Auxiliar de Limpeza', 'Agente de Higienização', 'Apoio Ed. Especial', 'Outro'] },
      { name: 'carga_horaria', label: 'Carga Horária', type: 'select', required: true, options: ['40h', '44h', '12x36h', 'Outro'] },
      { name: 'valor_posto', label: 'Valor do Posto', type: 'number', required: true },
    ]
  },
  'contracts': {
    id: 'contracts',
    name: 'Gestão de Contratos',
    icon: 'FileText',
    color: 'violet',
    unit: 'contratos',
    consumptionLabel: 'Contratos',
    fields: [
      { name: 'numero_contrato', label: 'Número do Contrato', type: 'text', required: true },
      { name: 'nome_empresa', label: 'Nome da Empresa', type: 'text', required: true },
      { name: 'cnpj', label: 'CNPJ', type: 'text', required: true },
      { name: 'numero_empenho', label: 'Número do Empenho', type: 'text' },
      { name: 'objeto_contrato', label: 'Objeto do Contrato', type: 'text', required: true },
      { name: 'valor_mensal', label: 'Valor Mensal', type: 'number', required: true },
      { name: 'valor_anual', label: 'Valor Anual', type: 'number' },
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