import { useState } from "react";
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
  Users
} from "lucide-react";

interface HRNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const hrTabs = [
  { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
  { id: 'employees', name: 'Cadastro de Servidores', icon: UserPlus },
  { id: 'payroll', name: 'Folha de Pagamento', icon: Receipt },
  { id: 'costs', name: 'Análise de Custos', icon: TrendingUp },
  { id: 'reports', name: 'Relatórios', icon: FileText },
  { id: 'settings', name: 'Configurações', icon: Settings },
];

export function HRNavigation({ currentTab, onTabChange }: HRNavigationProps) {
  return (
    <Card className="p-4 bg-gradient-card border-border shadow-card mb-6">
      <div className="flex items-center gap-4 mb-4">
        <Users className="h-6 w-6 text-orange-500" />
        <h2 className="text-xl font-semibold text-foreground">Sistema de Gestão de RH</h2>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {hrTabs.map((tab) => {
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
                isActive && "bg-orange-500 hover:bg-orange-600 text-white",
                !isActive && "border-orange-200 text-orange-600 hover:bg-orange-50"
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