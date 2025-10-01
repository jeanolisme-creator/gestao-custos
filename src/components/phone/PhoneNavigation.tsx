import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Plus,
  TrendingUp,
  FileText,
  Settings,
  Phone
} from "lucide-react";

interface PhoneNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const phoneTabs = [
  { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
  { id: 'register', name: 'Novo Cadastro', icon: Plus },
  { id: 'charts', name: 'Gráficos', icon: TrendingUp },
  { id: 'reports', name: 'Relatórios', icon: FileText },
  { id: 'settings', name: 'Configurações', icon: Settings },
];

export function PhoneNavigation({ currentTab, onTabChange }: PhoneNavigationProps) {
  return (
    <Card className="p-4 bg-gradient-card border-border shadow-card mb-6">
      <div className="flex items-center gap-4 mb-4">
        <Phone className="h-6 w-6 text-green-500" />
        <h2 className="text-xl font-semibold text-foreground">Sistema de Gestão de Linha Fixa</h2>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {phoneTabs.map((tab) => {
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
                isActive && "bg-green-500 hover:bg-green-600 text-white",
                !isActive && "border-green-200 text-green-600 hover:bg-green-50"
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
