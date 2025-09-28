import {
  GraduationCap,
  Users,
  Baby,
  BookOpen,
  Calculator,
  TrendingUp,
  Building2,
  Phone,
  Mail,
  Link,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SchoolDemandRecord {
  id: string;
  nome_escola: string;
  endereco_completo?: string;
  numero?: string;
  bairro?: string;
  macroregiao?: string;
  telefone?: string;
  email?: string;
  alunos_creche: number;
  alunos_infantil: number;
  alunos_fundamental_i: number;
  alunos_fundamental_ii: number;
  total_alunos: number;
  alunos_por_turma?: number;
  created_at: string;
  updated_at: string;
}

export default function SchoolDemandDashboard() {
  const [schools, setSchools] = useState<SchoolDemandRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('school_demand_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchools(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar escolas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalCreche = schools.reduce((sum, school) => sum + school.alunos_creche, 0);
  const totalInfantil = schools.reduce((sum, school) => sum + school.alunos_infantil, 0);
  const totalFundamentalI = schools.reduce((sum, school) => sum + school.alunos_fundamental_i, 0);
  const totalFundamentalII = schools.reduce((sum, school) => sum + school.alunos_fundamental_ii, 0);
  const totalAlunos = totalCreche + totalInfantil + totalFundamentalI + totalFundamentalII;
  const totalEscolas = schools.length;

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6 space-y-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Dashboard de Demanda Escolar
                </h1>
                <p className="text-muted-foreground">
                  Acompanhamento completo da demanda de alunos nas escolas municipais
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/school-demand/integracoes'}
                >
                  <Link className="h-4 w-4 mr-2" />
                  Integrações
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/school-demand/importar'}
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Importar Dados
                </Button>
                <Button 
                  className="bg-school-demand text-white hover:bg-school-demand/90"
                  onClick={() => window.location.href = '/school-demand/cadastro'}
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Nova Escola
                </Button>
              </div>
            </div>
        </div>

        {/* Main Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Creche (0 a 3 anos)"
            value={formatNumber(totalCreche)}
            icon={Baby}
            description={`${schools.filter(s => s.alunos_creche > 0).length} escolas`}
            variant="primary"
          />
          <MetricCard
            title="Infantil/Pré-escola (4 a 5 anos)"
            value={formatNumber(totalInfantil)}
            icon={Users}
            description={`${schools.filter(s => s.alunos_infantil > 0).length} escolas`}
            variant="success"
          />
          <MetricCard
            title="Fundamental I (6 a 10 anos)"
            value={formatNumber(totalFundamentalI)}
            icon={BookOpen}
            description={`${schools.filter(s => s.alunos_fundamental_i > 0).length} escolas`}
            variant="warning"
          />
          <MetricCard
            title="Fundamental II (11 a 14 anos)"
            value={formatNumber(totalFundamentalII)}
            icon={Calculator}
            description={`${schools.filter(s => s.alunos_fundamental_ii > 0).length} escolas`}
            variant="primary"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="Total de Alunos"
            value={formatNumber(totalAlunos)}
            icon={Users}
            description="Todas as faixas etárias"
            variant="success"
            trend={{ value: 8.2, isPositive: true }}
          />
          <MetricCard
            title="Total de Escolas"
            value={formatNumber(totalEscolas)}
            icon={Building2}
            description="Escolas cadastradas"
            variant="primary"
          />
          <MetricCard
            title="Média por Escola"
            value={formatNumber(totalEscolas > 0 ? Math.round(totalAlunos / totalEscolas) : 0)}
            icon={TrendingUp}
            description="Alunos por escola"
            variant="warning"
          />
        </div>

        {/* Schools List */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-school-demand" />
              Escolas Cadastradas
            </CardTitle>
            <CardDescription>
              Lista completa das escolas e sua demanda de alunos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {schools.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma escola cadastrada
                </h3>
                <p className="text-muted-foreground mb-4">
                  Comece cadastrando a primeira escola para acompanhar a demanda
                </p>
                <Button 
                  className="bg-school-demand text-white hover:bg-school-demand/90"
                  onClick={() => window.location.href = '/school-demand/cadastro'}
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Cadastrar Escola
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {schools.map((school) => (
                  <Card key={school.id} className="border border-border/50 hover:border-school-demand/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <h3 className="font-medium text-foreground">
                            {school.nome_escola}
                          </h3>
                          {school.endereco_completo && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {school.endereco_completo}
                              {school.numero && `, ${school.numero}`}
                              {school.bairro && ` - ${school.bairro}`}
                            </p>
                          )}
                          {school.macroregiao && (
                            <Badge variant="outline" className="text-xs">
                              {school.macroregiao}
                            </Badge>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {school.telefone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {school.telefone}
                              </div>
                            )}
                            {school.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {school.email}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="text-2xl font-bold text-school-demand">
                            {formatNumber(school.total_alunos)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total de alunos
                          </div>
                          <div className="flex flex-col gap-1 text-xs">
                            {school.alunos_creche > 0 && (
                              <div className="flex justify-between gap-2">
                                <span>Creche:</span>
                                <span className="font-medium">{school.alunos_creche}</span>
                              </div>
                            )}
                            {school.alunos_infantil > 0 && (
                              <div className="flex justify-between gap-2">
                                <span>Infantil:</span>
                                <span className="font-medium">{school.alunos_infantil}</span>
                              </div>
                            )}
                            {school.alunos_fundamental_i > 0 && (
                              <div className="flex justify-between gap-2">
                                <span>Fund. I:</span>
                                <span className="font-medium">{school.alunos_fundamental_i}</span>
                              </div>
                            )}
                            {school.alunos_fundamental_ii > 0 && (
                              <div className="flex justify-between gap-2">
                                <span>Fund. II:</span>
                                <span className="font-medium">{school.alunos_fundamental_ii}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}