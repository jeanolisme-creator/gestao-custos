import { Calendar, AlertCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { aggregateBySchool } from "@/utils/mockData";

interface UpcomingDuesProps {
  data: any[];
}

export function UpcomingDues({ data }: UpcomingDuesProps) {
  const schools = aggregateBySchool(data);
  const upcomingDues = schools
    .filter(school => school.upcomingDues.length > 0)
    .flatMap(school => 
      school.upcomingDues.map(due => ({
        schoolName: school.schoolName,
        ...due
      }))
    )
    .sort((a, b) => {
      const dateA = new Date(a.vencto.split('/').reverse().join('-'));
      const dateB = new Date(b.vencto.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 10);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate.split('/').reverse().join('-'));
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDuePriority = (days: number) => {
    if (days <= 2) return 'high';
    if (days <= 5) return 'medium';
    return 'low';
  };

  return (
    <Card className="p-6 bg-gradient-card border-border shadow-card">
      <div className="flex items-center space-x-2 mb-4">
        <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-warning" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Próximos Vencimentos
          </h3>
          <p className="text-sm text-muted-foreground">
            {upcomingDues.length} faturas vencendo nos próximos 7 dias
          </p>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {upcomingDues.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum vencimento próximo</p>
            <p className="text-xs">Todas as faturas estão em dia</p>
          </div>
        ) : (
          upcomingDues.map((due, index) => {
            const daysUntilDue = getDaysUntilDue(due.vencto);
            const priority = getDuePriority(daysUntilDue);
            
            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    priority === 'high' ? 'bg-destructive/10 text-destructive' :
                    priority === 'medium' ? 'bg-warning/10 text-warning' :
                    'bg-success/10 text-success'
                  }`}>
                    {priority === 'high' ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <Calendar className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      {due.schoolName.replace(/^(EMEF|EMEI|EMEIF|COMP|PAR)\s+/, '')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Vencimento: {due.vencto}
                    </p>
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <p className="font-semibold text-sm text-foreground">
                    {formatCurrency(due.valor + due.valorServ)}
                  </p>
                  <Badge 
                    variant={
                      priority === 'high' ? 'destructive' :
                      priority === 'medium' ? 'secondary' :
                      'outline'
                    }
                    className="text-xs"
                  >
                    {daysUntilDue === 0 ? 'Hoje' :
                     daysUntilDue === 1 ? 'Amanhã' :
                     `${daysUntilDue} dias`}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}