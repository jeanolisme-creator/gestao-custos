import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Plus,
  TrendingUp,
  FileText,
  Settings,
  Zap
} from "lucide-react";

interface EnergyNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const energyTabs = [
  { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
  { id: 'register', name: 'Novo Cadastro', icon: Plus },
  { id: 'charts', name: 'Gráficos', icon: TrendingUp },
  { id: 'reports', name: 'Relatórios', icon: FileText },
  { id: 'settings', name: 'Configurações', icon: Settings },
];

export function EnergyNavigation({ currentTab, onTabChange }: EnergyNavigationProps) {
  return (
    <Card className="p-4 bg-gradient-card border-border shadow-card mb-6">
      <div className="flex items-center gap-4 mb-4">
        <Zap className="h-6 w-6 text-yellow-500" />
        <h2 className="text-xl font-semibold text-foreground">Sistema de Gestão de Energia</h2>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {energyTabs.map((tab) => {
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
                isActive && "bg-yellow-500 hover:bg-yellow-600 text-white",
                !isActive && "border-yellow-200 text-yellow-600 hover:bg-yellow-50"
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
