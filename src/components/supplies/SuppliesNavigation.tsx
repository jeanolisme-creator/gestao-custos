import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Plus,
  TrendingUp,
  FileText,
  Settings,
  Package
} from "lucide-react";

interface SuppliesNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const suppliesTabs = [
  { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
  { id: 'register', name: 'Novo Cadastro', icon: Plus },
  { id: 'charts', name: 'Gráficos', icon: TrendingUp },
  { id: 'reports', name: 'Relatórios', icon: FileText },
  { id: 'settings', name: 'Configurações', icon: Settings },
];

export function SuppliesNavigation({ currentTab, onTabChange }: SuppliesNavigationProps) {
  return (
    <Card className="p-4 bg-gradient-card border-border shadow-card mb-6">
      <div className="flex items-center gap-4 mb-4">
        <Package className="h-6 w-6 text-emerald-500" />
        <h2 className="text-xl font-semibold text-foreground">Sistema de Gestão de Suprimentos</h2>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {suppliesTabs.map((tab) => {
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
                isActive && "bg-emerald-500 hover:bg-emerald-600 text-white",
                !isActive && "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
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
