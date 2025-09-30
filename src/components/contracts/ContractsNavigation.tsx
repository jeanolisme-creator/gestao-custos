import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  FileSignature,
  TrendingUp,
  FileText,
  Settings
} from "lucide-react";

interface ContractsNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const contractsTabs = [
  { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
  { id: 'register', name: 'Cadastro de Contratos', icon: FileSignature },
  { id: 'costs', name: 'Gráficos', icon: TrendingUp },
  { id: 'reports', name: 'Relatórios', icon: FileText },
  { id: 'settings', name: 'Configurações', icon: Settings },
];

export function ContractsNavigation({ currentTab, onTabChange }: ContractsNavigationProps) {
  return (
    <Card className="p-4 bg-gradient-card border-border shadow-card mb-6">
      <div className="flex items-center gap-4 mb-4">
        <FileSignature className="h-6 w-6 text-violet-500" />
        <h2 className="text-xl font-semibold text-foreground">Sistema de Gestão de Contratos</h2>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {contractsTabs.map((tab) => {
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
                isActive && "bg-violet-500 hover:bg-violet-600 text-white",
                !isActive && "border-violet-200 text-violet-600 hover:bg-violet-50"
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
