import { SystemType } from '@/contexts/SystemContext';

// Extended interface for unified records
export interface UnifiedRecord {
  id: string;
  system_type: SystemType;
  cadastro: string;
  nome_escola: string;
  responsavel?: string;
  mes_ano_referencia: string;
  valor_gasto: number;
  valor_servicos: number;
  numero_dias?: number;
  data_vencimento?: string;
  ocorrencias_pendencias?: string;
  descricao_servicos?: string;
  created_at: string;
  updated_at: string;
  
  // Water specific
  hidrometro?: string;
  endereco_completo?: string;
  consumo_m3?: number;
  
  // Energy specific
  cadastro_cliente?: string;
  relogio?: string;
  tipo_instalacao?: string;
  demanda_kwh?: number;
  unidade?: string;
  proprietario?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  macroregiao?: string;
  tipo_escola?: string;
  consumo_kwh?: number;
  
  // Fixed line specific
  numero_linha?: string;
  
  // Mobile specific  
  consumo_mb?: number;
}

export const generateMockSystemData = (systemType: SystemType, count: number = 50): UnifiedRecord[] => {
  const data: UnifiedRecord[] = [];
  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  
  const schoolNames = [
    'Escola Municipal João Silva', 'EMEI Maria Santos', 'EM Prof. Carlos Lima',
    'Escola Municipal Santa Rita', 'EMEF Ana Costa', 'EM Dr. Pedro Alves',
    'Escola Municipal São José', 'EMEI Rosa Flores', 'EM Prof. Lucia Gomes',
    'Escola Municipal Central', 'EMEF Paulo Freire', 'EM Monteiro Lobato'
  ];

  const tiposEscola = ['EMEF', 'EMEI', 'EMEIF', 'PAR', 'COMP'];
  const macroregioes = ['HB', 'Vila Toninho', 'Schmidt', 'Represa', 'Bosque', 'Talhado', 'Central', 'Cidade da Criança', 'Pinheirinho', 'Ceu'];
  const bairros = ['Centro', 'Vila Nova', 'Jardim das Flores', 'Bela Vista', 'São João'];

  for (let i = 0; i < count; i++) {
    const baseRecord: UnifiedRecord = {
      id: `${systemType}-${i + 1}`,
      system_type: systemType,
      cadastro: `${systemType.toUpperCase()}-${(Math.floor(Math.random() * 9000) + 1000).toString()}`,
      nome_escola: schoolNames[Math.floor(Math.random() * schoolNames.length)],
      responsavel: `Responsável ${i + 1}`,
      mes_ano_referencia: `${months[Math.floor(Math.random() * months.length)]} 2025`,
      valor_gasto: Math.floor(Math.random() * 5000) + 500,
      valor_servicos: Math.floor(Math.random() * 500) + 50,
      numero_dias: 30,
      data_vencimento: `2025-12-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add system-specific fields
    switch (systemType) {
      case 'water':
        Object.assign(baseRecord, {
          hidrometro: `HID-${Math.floor(Math.random() * 100000)}`,
          endereco_completo: `Rua ${i + 1}, ${Math.floor(Math.random() * 999) + 1} - ${bairros[Math.floor(Math.random() * bairros.length)]}`,
          consumo_m3: Math.floor(Math.random() * 200) + 50,
        });
        break;
        
      case 'energy':
        Object.assign(baseRecord, {
          cadastro_cliente: baseRecord.cadastro,
          relogio: `REL-${Math.floor(Math.random() * 100000)}`,
          tipo_instalacao: Math.random() > 0.5 ? 'BAIXA' : 'MEDIA/ALTA',
          demanda_kwh: Math.floor(Math.random() * 1000) + 100,
          unidade: `UN-${i + 1}`,
          proprietario: `Prefeitura Municipal`,
          endereco: `Rua ${i + 1}`,
          numero: `${Math.floor(Math.random() * 999) + 1}`,
          bairro: bairros[Math.floor(Math.random() * bairros.length)],
          macroregiao: macroregioes[Math.floor(Math.random() * macroregioes.length)],
          tipo_escola: tiposEscola[Math.floor(Math.random() * tiposEscola.length)],
          consumo_kwh: Math.floor(Math.random() * 5000) + 500,
        });
        break;
        
      case 'fixed-line':
        Object.assign(baseRecord, {
          cadastro_cliente: baseRecord.cadastro,
          numero_linha: `(11) ${Math.floor(Math.random() * 8999) + 1000}-${Math.floor(Math.random() * 8999) + 1000}`,
          proprietario: `Prefeitura Municipal`,
          endereco: `Rua ${i + 1}`,
          numero: `${Math.floor(Math.random() * 999) + 1}`,
          bairro: bairros[Math.floor(Math.random() * bairros.length)],
          macroregiao: macroregioes[Math.floor(Math.random() * macroregioes.length)],
          tipo_escola: tiposEscola[Math.floor(Math.random() * tiposEscola.length)],
        });
        break;
        
      case 'mobile':
        Object.assign(baseRecord, {
          cadastro_cliente: baseRecord.cadastro,
          numero_linha: `(11) 9${Math.floor(Math.random() * 8999) + 1000}-${Math.floor(Math.random() * 8999) + 1000}`,
          proprietario: `Prefeitura Municipal`,
          endereco: `Rua ${i + 1}`,
          numero: `${Math.floor(Math.random() * 999) + 1}`,
          bairro: bairros[Math.floor(Math.random() * bairros.length)],
          macroregiao: macroregioes[Math.floor(Math.random() * macroregioes.length)],
          tipo_escola: tiposEscola[Math.floor(Math.random() * tiposEscola.length)],
          consumo_mb: Math.floor(Math.random() * 10000) + 1000,
        });
        break;
    }

    data.push(baseRecord);
  }

  return data;
};

export const aggregateSystemData = (data: UnifiedRecord[], month?: string) => {
  const filteredData = month ? data.filter(record => 
    record.mes_ano_referencia.toLowerCase().includes(month.toLowerCase())
  ) : data;

  const groupedBySchool = filteredData.reduce((acc, record) => {
    if (!acc[record.nome_escola]) {
      acc[record.nome_escola] = [];
    }
    acc[record.nome_escola].push(record);
    return acc;
  }, {} as Record<string, UnifiedRecord[]>);

  return Object.entries(groupedBySchool).map(([schoolName, records]) => ({
    schoolName,
    totalValue: records.reduce((sum, record) => sum + record.valor_gasto, 0),
    totalConsumption: records.reduce((sum, record) => {
      if (record.system_type === 'water') return sum + (record.consumo_m3 || 0);
      if (record.system_type === 'energy') return sum + (record.consumo_kwh || 0);
      if (record.system_type === 'mobile') return sum + (record.consumo_mb || 0);
      return sum;
    }, 0),
    totalService: records.reduce((sum, record) => sum + record.valor_servicos, 0),
    records: records.length,
    cadastros: [...new Set(records.map(r => r.cadastro))],
    upcomingDues: records.filter(record => 
      record.data_vencimento && new Date(record.data_vencimento) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ),
  }));
};

export const getSystemMonthlyTotals = (data: UnifiedRecord[]) => {
  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  
  return months.map(month => {
    const monthData = data.filter(record => 
      record.mes_ano_referencia.toLowerCase().includes(month.toLowerCase())
    );
    
    return {
      month,
      totalValue: monthData.reduce((sum, record) => sum + record.valor_gasto, 0),
      totalConsumption: monthData.reduce((sum, record) => {
        if (record.system_type === 'water') return sum + (record.consumo_m3 || 0);
        if (record.system_type === 'energy') return sum + (record.consumo_kwh || 0);
        if (record.system_type === 'mobile') return sum + (record.consumo_mb || 0);
        return sum;
      }, 0),
      totalService: monthData.reduce((sum, record) => sum + record.valor_servicos, 0),
      schoolCount: new Set(monthData.map(r => r.nome_escola)).size,
    };
  });
};

export const getSystemAlerts = (data: UnifiedRecord[], thresholdPercent: number = 20) => {
  const currentMonthData = data.filter(record => 
    record.mes_ano_referencia.toLowerCase().includes('dezembro')
  );
  const previousMonthData = data.filter(record => 
    record.mes_ano_referencia.toLowerCase().includes('novembro')
  );

  const alerts: Array<{
    schoolName: string;
    variation: number;
    currentConsumption: number;
    previousConsumption: number;
    type: 'increase' | 'decrease';
  }> = [];

  currentMonthData.forEach(currentRecord => {
    const previousRecord = previousMonthData.find(
      prev => prev.nome_escola === currentRecord.nome_escola && prev.system_type === currentRecord.system_type
    );

    if (previousRecord) {
      const currentConsumption = getCurrentConsumption(currentRecord);
      const previousConsumption = getCurrentConsumption(previousRecord);
      
      if (previousConsumption > 0) {
        const variation = ((currentConsumption - previousConsumption) / previousConsumption) * 100;
        
        if (Math.abs(variation) >= thresholdPercent) {
          alerts.push({
            schoolName: currentRecord.nome_escola,
            variation: Math.abs(variation),
            currentConsumption,
            previousConsumption,
            type: variation > 0 ? 'increase' : 'decrease',
          });
        }
      }
    }
  });

  return alerts;
};

function getCurrentConsumption(record: UnifiedRecord): number {
  switch (record.system_type) {
    case 'water': return record.consumo_m3 || 0;
    case 'energy': return record.consumo_kwh || 0;
    case 'mobile': return record.consumo_mb || 0;
    default: return 0;
  }
}