import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

const availableFields = [
  { value: 'cadastro', label: 'Cadastro' },
  { value: 'hidrometro', label: 'Hidrômetro' },
  { value: 'consumo_m3', label: 'Consumo (m³)' },
  { value: 'numero_dias', label: 'Número de Dias' },
  { value: 'data_leitura_anterior', label: 'Data Leitura Anterior' },
  { value: 'data_leitura_atual', label: 'Data Leitura Atual' },
  { value: 'data_vencimento', label: 'Data Vencimento' },
  { value: 'valor_gasto', label: 'Valor (R$)' },
];

const availableMonths = [
  'Janeiro/2025', 'Fevereiro/2025', 'Março/2025', 'Abril/2025',
  'Maio/2025', 'Junho/2025', 'Julho/2025', 'Agosto/2025',
  'Setembro/2025', 'Outubro/2025', 'Novembro/2025', 'Dezembro/2025'
];

const macroregions = [
  'HB', 'Vila Toninho', 'Schmidt', 'Represa', 'Bosque',
  'Talhado', 'Central', 'Cidade da Criança', 'CEU', 'Pinheirinho'
];

const schoolTypes = ['EMEI', 'EMEF', 'EMEIF', 'PAR', 'COMP', 'SEDE'];

interface FieldSelectorProps {
  selectedFields: string[];
  onChange: (fields: string[]) => void;
}

export function FieldSelector({ selectedFields, onChange }: FieldSelectorProps) {
  const toggleField = (field: string) => {
    if (selectedFields.includes(field)) {
      onChange(selectedFields.filter(f => f !== field));
    } else {
      onChange([...selectedFields, field]);
    }
  };

  const selectAll = () => {
    onChange(availableFields.map(f => f.value));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-base font-semibold">Selecione os Campos</Label>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Todos
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              Limpar
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {availableFields.map((field) => (
            <div key={field.value} className="flex items-center space-x-2">
              <Checkbox
                id={field.value}
                checked={selectedFields.includes(field.value)}
                onCheckedChange={() => toggleField(field.value)}
              />
              <Label
                htmlFor={field.value}
                className="text-sm font-normal cursor-pointer"
              >
                {field.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

interface SchoolMultiSelectorProps {
  schools: string[];
  selectedSchools: string[];
  onChange: (schools: string[]) => void;
  maxSchools?: number;
}

export function SchoolMultiSelector({
  schools,
  selectedSchools,
  onChange,
  maxSchools = 15
}: SchoolMultiSelectorProps) {
  const toggleSchool = (school: string) => {
    if (selectedSchools.includes(school)) {
      onChange(selectedSchools.filter(s => s !== school));
    } else if (selectedSchools.length < maxSchools) {
      onChange([...selectedSchools, school]);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          Selecione até {maxSchools} Escolas ({selectedSchools.length}/{maxSchools})
        </Label>
        <div className="max-h-60 overflow-y-auto space-y-2">
          {schools.map((school) => (
            <div key={school} className="flex items-center space-x-2">
              <Checkbox
                id={`school-${school}`}
                checked={selectedSchools.includes(school)}
                onCheckedChange={() => toggleSchool(school)}
                disabled={!selectedSchools.includes(school) && selectedSchools.length >= maxSchools}
              />
              <Label
                htmlFor={`school-${school}`}
                className="text-sm font-normal cursor-pointer"
              >
                {school}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

interface MonthSelectorProps {
  selectedMonths: string[];
  onChange: (months: string[]) => void;
}

export function MonthSelector({ selectedMonths, onChange }: MonthSelectorProps) {
  const toggleMonth = (month: string) => {
    if (selectedMonths.includes(month)) {
      onChange(selectedMonths.filter(m => m !== month));
    } else {
      onChange([...selectedMonths, month]);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <Label className="text-base font-semibold">Selecione os Meses</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {availableMonths.map((month) => (
            <div key={month} className="flex items-center space-x-2">
              <Checkbox
                id={`month-${month}`}
                checked={selectedMonths.includes(month)}
                onCheckedChange={() => toggleMonth(month)}
              />
              <Label
                htmlFor={`month-${month}`}
                className="text-sm font-normal cursor-pointer"
              >
                {month}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

interface MacroregionSelectorProps {
  selectedMacroregions: string[];
  onChange: (macroregions: string[]) => void;
}

export function MacroregionSelector({ selectedMacroregions, onChange }: MacroregionSelectorProps) {
  const toggleMacroregion = (macroregion: string) => {
    if (selectedMacroregions.includes(macroregion)) {
      onChange(selectedMacroregions.filter(m => m !== macroregion));
    } else {
      onChange([...selectedMacroregions, macroregion]);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <Label className="text-base font-semibold">Selecione as Macroregiões</Label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {macroregions.map((macroregion) => (
            <div key={macroregion} className="flex items-center space-x-2">
              <Checkbox
                id={`macro-${macroregion}`}
                checked={selectedMacroregions.includes(macroregion)}
                onCheckedChange={() => toggleMacroregion(macroregion)}
              />
              <Label
                htmlFor={`macro-${macroregion}`}
                className="text-sm font-normal cursor-pointer"
              >
                {macroregion}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

interface SchoolTypeSelectorProps {
  selectedSchoolTypes: string[];
  onChange: (types: string[]) => void;
}

export function SchoolTypeSelector({ selectedSchoolTypes, onChange }: SchoolTypeSelectorProps) {
  const toggleType = (type: string) => {
    if (selectedSchoolTypes.includes(type)) {
      onChange(selectedSchoolTypes.filter(t => t !== type));
    } else {
      onChange([...selectedSchoolTypes, type]);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <Label className="text-base font-semibold">Selecione os Tipos de Escola</Label>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {schoolTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={selectedSchoolTypes.includes(type)}
                onCheckedChange={() => toggleType(type)}
              />
              <Label
                htmlFor={`type-${type}`}
                className="text-sm font-normal cursor-pointer"
              >
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
};

const formatDate = (date: string | null) => {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
};

interface SelectedFieldsReportProps {
  data: any[];
  selectedFields: string[];
}

export function SelectedFieldsReport({ data, selectedFields }: SelectedFieldsReportProps) {
  if (selectedFields.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        Selecione pelo menos um campo para visualizar o relatório
      </Card>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Escola</TableHead>
          {selectedFields.map((field) => (
            <TableHead key={field}>
              {availableFields.find(f => f.value === field)?.label || field}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((record, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{record.nome_escola}</TableCell>
            {selectedFields.map((field) => (
              <TableCell key={field}>
                {field === 'valor_gasto' || field === 'valor_servicos'
                  ? formatCurrency(record[field] || 0)
                  : field.includes('data_')
                  ? formatDate(record[field])
                  : field === 'consumo_m3'
                  ? `${(record[field] || 0).toFixed(1)} m³`
                  : record[field] || '-'}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

interface MonthlyComparisonReportProps {
  data: any[];
  selectedSchools: string[];
  selectedMonths: string[];
}

export function MonthlyComparisonReport({ data, selectedSchools, selectedMonths }: MonthlyComparisonReportProps) {
  if (selectedSchools.length === 0 || selectedMonths.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        Selecione escolas e meses para visualizar o comparativo
      </Card>
    );
  }

  // Agrupar dados por escola e mês
  const comparisonData = selectedSchools.map(schoolName => {
    const schoolData: any = { schoolName };
    selectedMonths.forEach(month => {
      const records = data.filter(
        r => r.nome_escola === schoolName && r.mes_ano_referencia === month
      );
      const totalConsumption = records.reduce((sum, r) => sum + (parseFloat(r.consumo_m3) || 0), 0);
      const totalValue = records.reduce((sum, r) => sum + (parseFloat(r.valor_gasto) || 0), 0);
      schoolData[month] = { consumption: totalConsumption, value: totalValue };
    });
    return schoolData;
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Escola</TableHead>
          {selectedMonths.map((month) => (
            <TableHead key={month} className="text-center">
              {month}
              <div className="text-xs text-muted-foreground font-normal">m³ / Valor</div>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {comparisonData.map((school, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{school.schoolName}</TableCell>
            {selectedMonths.map((month) => (
              <TableCell key={month} className="text-center">
                <div className="flex flex-col gap-1">
                  <span className="text-sm">{school[month]?.consumption.toFixed(1) || 0} m³</span>
                  <span className="text-sm font-semibold text-primary">
                    {formatCurrency(school[month]?.value || 0)}
                  </span>
                </div>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

interface StudentComparisonReportProps {
  data: any[];
  schoolsData: any[];
  selectedSchools: string[];
}

export function StudentComparisonReport({ data, schoolsData, selectedSchools }: StudentComparisonReportProps) {
  if (selectedSchools.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        Selecione escolas para visualizar o comparativo por alunos
      </Card>
    );
  }

  const comparisonData = selectedSchools.map(schoolName => {
    const schoolInfo = schoolsData.find(s => s.nome_escola === schoolName);
    const schoolRecords = data.filter(r => r.nome_escola === schoolName);
    const totalConsumption = schoolRecords.reduce((sum, r) => sum + (parseFloat(r.consumo_m3) || 0), 0);
    const totalValue = schoolRecords.reduce((sum, r) => sum + (parseFloat(r.valor_gasto) || 0), 0);

    return {
      schoolName,
      creche: schoolInfo?.alunos_creche || 0,
      infantil: schoolInfo?.alunos_infantil || 0,
      fundamentalI: schoolInfo?.alunos_fundamental_i || 0,
      fundamentalII: schoolInfo?.alunos_fundamental_ii || 0,
      totalStudents: schoolInfo?.total_alunos || 0,
      totalConsumption,
      totalValue,
      consumptionPerStudent: schoolInfo?.total_alunos ? totalConsumption / schoolInfo.total_alunos : 0,
      valuePerStudent: schoolInfo?.total_alunos ? totalValue / schoolInfo.total_alunos : 0,
    };
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Escola</TableHead>
          <TableHead className="text-center">Creche (0-3)</TableHead>
          <TableHead className="text-center">Infantil (4-5)</TableHead>
          <TableHead className="text-center">Fund. I (6-10)</TableHead>
          <TableHead className="text-center">Fund. II (11-14)</TableHead>
          <TableHead className="text-center">Total Alunos</TableHead>
          <TableHead className="text-right">Consumo Total</TableHead>
          <TableHead className="text-right">Valor Total</TableHead>
          <TableHead className="text-right">m³/Aluno</TableHead>
          <TableHead className="text-right">R$/Aluno</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {comparisonData.map((school, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{school.schoolName}</TableCell>
            <TableCell className="text-center">{school.creche}</TableCell>
            <TableCell className="text-center">{school.infantil}</TableCell>
            <TableCell className="text-center">{school.fundamentalI}</TableCell>
            <TableCell className="text-center">{school.fundamentalII}</TableCell>
            <TableCell className="text-center font-semibold">{school.totalStudents}</TableCell>
            <TableCell className="text-right">{school.totalConsumption.toFixed(1)} m³</TableCell>
            <TableCell className="text-right font-semibold">{formatCurrency(school.totalValue)}</TableCell>
            <TableCell className="text-right">{school.consumptionPerStudent.toFixed(2)}</TableCell>
            <TableCell className="text-right text-primary font-semibold">
              {formatCurrency(school.valuePerStudent)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

interface MacroregionComparisonReportProps {
  data: any[];
  selectedMacroregions: string[];
}

export function MacroregionComparisonReport({ data, selectedMacroregions }: MacroregionComparisonReportProps) {
  if (selectedMacroregions.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        Selecione macroregiões para visualizar o comparativo
      </Card>
    );
  }

  const comparisonData = selectedMacroregions.map(macroregion => {
    const records = data.filter(r => r.macroregiao === macroregion);
    const schools = new Set(records.map(r => r.nome_escola));
    const totalConsumption = records.reduce((sum, r) => sum + (parseFloat(r.consumo_m3) || 0), 0);
    const totalValue = records.reduce((sum, r) => sum + (parseFloat(r.valor_gasto) || 0), 0);

    return {
      macroregion,
      schoolCount: schools.size,
      totalConsumption,
      totalValue,
      avgConsumption: schools.size > 0 ? totalConsumption / schools.size : 0,
      avgValue: schools.size > 0 ? totalValue / schools.size : 0,
    };
  });

  const totals = comparisonData.reduce(
    (acc, item) => ({
      schoolCount: acc.schoolCount + item.schoolCount,
      totalConsumption: acc.totalConsumption + item.totalConsumption,
      totalValue: acc.totalValue + item.totalValue,
    }),
    { schoolCount: 0, totalConsumption: 0, totalValue: 0 }
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Macrorregião</TableHead>
          <TableHead className="text-center">Nº Escolas</TableHead>
          <TableHead className="text-right">Consumo Total</TableHead>
          <TableHead className="text-right">Valor Total</TableHead>
          <TableHead className="text-right">Média Consumo/Escola</TableHead>
          <TableHead className="text-right">Média Valor/Escola</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {comparisonData.map((item, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{item.macroregion}</TableCell>
            <TableCell className="text-center">
              <Badge variant="outline">{item.schoolCount}</Badge>
            </TableCell>
            <TableCell className="text-right">{item.totalConsumption.toFixed(1)} m³</TableCell>
            <TableCell className="text-right font-semibold">{formatCurrency(item.totalValue)}</TableCell>
            <TableCell className="text-right">{item.avgConsumption.toFixed(1)} m³</TableCell>
            <TableCell className="text-right text-primary font-semibold">
              {formatCurrency(item.avgValue)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell className="font-bold">TOTAL</TableCell>
          <TableCell className="text-center">
            <Badge>{totals.schoolCount}</Badge>
          </TableCell>
          <TableCell className="text-right font-bold">{totals.totalConsumption.toFixed(1)} m³</TableCell>
          <TableCell className="text-right font-bold">{formatCurrency(totals.totalValue)}</TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

interface SchoolTypeComparisonReportProps {
  data: any[];
  selectedSchoolTypes: string[];
}

export function SchoolTypeComparisonReport({ data, selectedSchoolTypes }: SchoolTypeComparisonReportProps) {
  if (selectedSchoolTypes.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        Selecione tipos de escola para visualizar o comparativo
      </Card>
    );
  }

  const comparisonData = selectedSchoolTypes.map(type => {
    const records = data.filter(r => r.tipo_escola === type);
    const schools = new Set(records.map(r => r.nome_escola));
    const totalConsumption = records.reduce((sum, r) => sum + (parseFloat(r.consumo_m3) || 0), 0);
    const totalValue = records.reduce((sum, r) => sum + (parseFloat(r.valor_gasto) || 0), 0);

    return {
      type,
      schoolCount: schools.size,
      totalConsumption,
      totalValue,
      avgConsumption: schools.size > 0 ? totalConsumption / schools.size : 0,
      avgValue: schools.size > 0 ? totalValue / schools.size : 0,
    };
  });

  const totals = comparisonData.reduce(
    (acc, item) => ({
      schoolCount: acc.schoolCount + item.schoolCount,
      totalConsumption: acc.totalConsumption + item.totalConsumption,
      totalValue: acc.totalValue + item.totalValue,
    }),
    { schoolCount: 0, totalConsumption: 0, totalValue: 0 }
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo de Escola</TableHead>
          <TableHead className="text-center">Nº Escolas</TableHead>
          <TableHead className="text-right">Consumo Total</TableHead>
          <TableHead className="text-right">Valor Total</TableHead>
          <TableHead className="text-right">Média Consumo/Escola</TableHead>
          <TableHead className="text-right">Média Valor/Escola</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {comparisonData.map((item, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{item.type}</TableCell>
            <TableCell className="text-center">
              <Badge variant="outline">{item.schoolCount}</Badge>
            </TableCell>
            <TableCell className="text-right">{item.totalConsumption.toFixed(1)} m³</TableCell>
            <TableCell className="text-right font-semibold">{formatCurrency(item.totalValue)}</TableCell>
            <TableCell className="text-right">{item.avgConsumption.toFixed(1)} m³</TableCell>
            <TableCell className="text-right text-primary font-semibold">
              {formatCurrency(item.avgValue)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell className="font-bold">TOTAL</TableCell>
          <TableCell className="text-center">
            <Badge>{totals.schoolCount}</Badge>
          </TableCell>
          <TableCell className="text-right font-bold">{totals.totalConsumption.toFixed(1)} m³</TableCell>
          <TableCell className="text-right font-bold">{formatCurrency(totals.totalValue)}</TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
