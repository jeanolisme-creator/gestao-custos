import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  UserPlus,
  Receipt,
  TrendingUp,
  FileText,
  Settings,
  UserCog
} from "lucide-react";

interface OutsourcedNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const outsourcedTabs = [
  { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
  { id: 'employees', name: 'Cadastro de Funcionários', icon: UserPlus },
  { id: 'payroll', name: 'Folha de Pagamento', icon: Receipt },
  { id: 'costs', name: 'Análise de Custos', icon: TrendingUp },
  { id: 'reports', name: 'Relatórios', icon: FileText },
  { id: 'settings', name: 'Configurações', icon: Settings },
];

export function OutsourcedNavigation({ currentTab, onTabChange }: OutsourcedNavigationProps) {
  return (
    <Card className="p-4 bg-gradient-card border-border shadow-card mb-6">
      <div className="flex items-center gap-4 mb-4">
        <UserCog className="h-6 w-6 text-cyan-500" />
        <h2 className="text-xl font-semibold text-foreground">Sistema de Gestão de Terceirizados</h2>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {outsourcedTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={cn(
                "transition-all duration-300",
                isActive && "bg-cyan-500 hover:bg-cyan-600 text-white",
                !isActive && "border-cyan-200 text-cyan-600 hover:bg-cyan-50"
              )}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.name}
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
