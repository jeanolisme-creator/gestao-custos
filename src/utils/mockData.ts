// Mock data for water management dashboard

export interface SchoolData {
  cadastro: string;
  proprietario: string;
  unidade: string;
  local: string;
  dtaLeitAnt: string;
  dtaLeitAtual: string;
  valor: number;
  vencto: string;
  endereco: string;
  consumo: number;
  nDias: number;
  hidrometro: string;
  servicos: string;
  valorServ: number;
  referencia: string;
  verificarOcorrencia: string;
  mes: string;
  ano: number;
}

export const schoolTypes = ['EMEF', 'EMEI', 'EMEIF', 'COMP', 'PAR'];

export const schoolNames = [
  'EMEF PROF. JOÃO SILVA',
  'EMEI MARIA MONTESSORI',
  'EMEIF PAULO FREIRE',
  'COMP CENTRO EDUCACIONAL',
  'PAR ESCOLA PARCEIRA',
  'EMEF SANTOS DUMONT',
  'EMEI CECÍLIA MEIRELES',
  'EMEIF ANÍSIO TEIXEIRA',
  'COMP ESPAÇO CRIATIVO',
  'PAR INSTITUTO EDUCAÇÃO',
  'EMEF MACHADO DE ASSIS',
  'EMEI CLARICE LISPECTOR',
  'EMEIF DARCY RIBEIRO',
  'COMP CENTRO INOVAÇÃO',
  'PAR ESCOLA SUSTENTÁVEL',
  'EMEF VILLA LOBOS',
  'EMEI TARSILA DO AMARAL',
  'EMEIF FLORESTAN FERNANDES',
  'COMP NÚCLEO PEDAGÓGICO',
  'PAR INSTITUTO FUTURO'
];

export const generateMockData = (): SchoolData[] => {
  const data: SchoolData[] = [];
  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  
  schoolNames.forEach((schoolName, schoolIndex) => {
    // Each school can have multiple cadastros
    const numCadastros = Math.floor(Math.random() * 3) + 1;
    
    for (let cadastroIndex = 0; cadastroIndex < numCadastros; cadastroIndex++) {
      const cadastro = `${(schoolIndex + 1).toString().padStart(3, '0')}-${cadastroIndex + 1}`;
      
      months.forEach((month, monthIndex) => {
        const baseConsumo = 15 + Math.random() * 35; // 15-50 m³
        const consumoVariation = (Math.random() - 0.5) * 0.4; // ±20% variation
        const consumo = Math.max(5, baseConsumo * (1 + consumoVariation));
        
        const valorPorM3 = 4.5 + Math.random() * 2; // R$ 4.50 - 6.50 per m³
        const valor = consumo * valorPorM3;
        
        const servicos = Math.random() > 0.7 ? 'Manutenção' : '';
        const valorServ = servicos ? Math.random() * 150 + 50 : 0;
        
        // Generate dates
        const currentDate = new Date(2025, monthIndex, Math.floor(Math.random() * 28) + 1);
        const previousDate = new Date(currentDate);
        previousDate.setMonth(previousDate.getMonth() - 1);
        
        const dueDate = new Date(currentDate);
        dueDate.setDate(currentDate.getDate() + 15 + Math.floor(Math.random() * 15));
        
        data.push({
          cadastro,
          proprietario: 'PREFEITURA MUNICIPAL',
          unidade: schoolName,
          local: schoolName.split(' ').slice(-2).join(' '),
          dtaLeitAnt: previousDate.toLocaleDateString('pt-BR'),
          dtaLeitAtual: currentDate.toLocaleDateString('pt-BR'),
          valor: Math.round(valor * 100) / 100,
          vencto: dueDate.toLocaleDateString('pt-BR'),
          endereco: `Rua ${schoolName.split(' ')[1]} ${schoolName.split(' ')[2]}, ${Math.floor(Math.random() * 9999) + 100}`,
          consumo: Math.round(consumo * 100) / 100,
          nDias: 30 + Math.floor(Math.random() * 5),
          hidrometro: `HID${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`,
          servicos,
          valorServ: Math.round(valorServ * 100) / 100,
          referencia: `${String(monthIndex + 1).padStart(2, '0')}/2025`,
          verificarOcorrencia: Math.random() > 0.8 ? 'Alto consumo' : '',
          mes: month,
          ano: 2025
        });
      });
    }
  });
  
  return data;
};

export const mockData = generateMockData();

// Helper functions for data processing
export const getSchoolsByName = (data: SchoolData[]) => {
  const schoolGroups = new Map<string, SchoolData[]>();
  
  data.forEach(record => {
    if (!schoolGroups.has(record.unidade)) {
      schoolGroups.set(record.unidade, []);
    }
    schoolGroups.get(record.unidade)!.push(record);
  });
  
  return schoolGroups;
};

export const aggregateBySchool = (data: any[], month?: string) => {
  // Check if data is from Supabase (has mes_ano_referencia) or mock data (has mes)
  const isSupabaseData = data.length > 0 && 'mes_ano_referencia' in data[0];
  
  let filtered = data;
  if (month) {
    if (isSupabaseData) {
      filtered = data.filter((d: any) => 
        d.mes_ano_referencia?.toLowerCase().includes(month.toLowerCase())
      );
    } else {
      filtered = data.filter((d: any) => d.mes === month);
    }
  }
  
  // Group by school name
  const schoolGroups = new Map<string, any[]>();
  filtered.forEach((record: any) => {
    const schoolName = isSupabaseData ? record.nome_escola : record.unidade;
    if (!schoolGroups.has(schoolName)) {
      schoolGroups.set(schoolName, []);
    }
    schoolGroups.get(schoolName)!.push(record);
  });
  
  return Array.from(schoolGroups.entries()).map(([schoolName, records]) => {
    if (isSupabaseData) {
      return {
        schoolName,
        totalValue: records.reduce((sum, r) => sum + Number(r.valor_gasto || 0), 0),
        totalConsumption: records.reduce((sum, r) => sum + Number(r.consumo_m3 || 0), 0),
        totalService: records.reduce((sum, r) => sum + Number(r.valor_servicos || 0), 0),
        records: records.length,
        cadastros: [...new Set(records.map(r => r.cadastro))],
        upcomingDues: records.filter(r => {
          if (!r.data_vencimento) return false;
          try {
            const dueDate = new Date(r.data_vencimento);
            const today = new Date();
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7 && diffDays >= 0;
          } catch (error) {
            return false;
          }
        })
      };
    } else {
      return {
        schoolName,
        totalValue: records.reduce((sum, r) => sum + r.valor + r.valorServ, 0),
        totalConsumption: records.reduce((sum, r) => sum + r.consumo, 0),
        totalService: records.reduce((sum, r) => sum + r.valorServ, 0),
        records: records.length,
        cadastros: [...new Set(records.map(r => r.cadastro))],
        upcomingDues: records.filter(r => {
          if (!r.vencto || typeof r.vencto !== 'string') return false;
          try {
            const dueDate = new Date(r.vencto.split('/').reverse().join('-'));
            const today = new Date();
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7 && diffDays >= 0;
          } catch (error) {
            return false;
          }
        })
      };
    }
  });
};

export const getMonthlyTotals = (data: any[]) => {
  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  
  // Check if data is from Supabase
  const isSupabaseData = data.length > 0 && 'mes_ano_referencia' in data[0];
  
  return months.map(month => {
    let monthData: any[];
    if (isSupabaseData) {
      monthData = data.filter((d: any) => 
        d.mes_ano_referencia?.toLowerCase().includes(month.toLowerCase())
      );
    } else {
      monthData = data.filter((d: any) => d.mes === month);
    }
    
    const aggregated = aggregateBySchool(monthData);
    
    return {
      month,
      totalValue: aggregated.reduce((sum, s) => sum + s.totalValue, 0),
      totalConsumption: aggregated.reduce((sum, s) => sum + s.totalConsumption, 0),
      totalService: aggregated.reduce((sum, s) => sum + s.totalService, 0),
      schoolCount: aggregated.length
    };
  });
};

export const getSchoolTypeDistribution = (data: any[], month?: string) => {
  // Check if data is from Supabase
  const isSupabaseData = data.length > 0 && 'mes_ano_referencia' in data[0];
  
  let filtered = data;
  if (month) {
    if (isSupabaseData) {
      filtered = data.filter((d: any) => 
        d.mes_ano_referencia?.toLowerCase().includes(month.toLowerCase())
      );
    } else {
      filtered = data.filter((d: any) => d.mes === month);
    }
  }
  
  const aggregated = aggregateBySchool(filtered);
  
  const distribution = schoolTypes.map(type => {
    const schoolsOfType = aggregated.filter(s => s.schoolName.includes(type));
    const totalValue = schoolsOfType.reduce((sum, s) => sum + s.totalValue, 0);
    
    return {
      type,
      count: schoolsOfType.length,
      value: totalValue,
      percentage: 0 // Will be calculated after
    };
  });
  
  const totalValue = distribution.reduce((sum, d) => sum + d.value, 0);
  distribution.forEach(d => {
    d.percentage = totalValue > 0 ? Math.round((d.value / totalValue) * 100) : 0;
  });
  
  return distribution;
};

export const getAlerts = (data: any[], thresholdPercent: number = 20) => {
  const currentMonth = 'dezembro'; // Current month for demo
  const previousMonth = 'novembro';
  
  const currentData = aggregateBySchool(data, currentMonth);
  const previousData = aggregateBySchool(data, previousMonth);
  
  const alerts = currentData.map(current => {
    const previous = previousData.find(p => p.schoolName === current.schoolName);
    if (!previous || previous.totalConsumption === 0) return null;
    
    const variation = ((current.totalConsumption - previous.totalConsumption) / previous.totalConsumption) * 100;
    
    if (Math.abs(variation) >= thresholdPercent) {
      return {
        schoolName: current.schoolName,
        variation: Math.round(variation * 100) / 100,
        currentConsumption: current.totalConsumption,
        previousConsumption: previous.totalConsumption,
        type: variation > 0 ? 'increase' : 'decrease'
      };
    }
    return null;
  }).filter(Boolean);
  
  return alerts;
};