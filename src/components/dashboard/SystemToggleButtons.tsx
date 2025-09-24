import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSystem, SystemType } from "@/contexts/SystemContext";
import { cn } from "@/lib/utils";
import { Droplets, Zap, Phone, Smartphone } from "lucide-react";

const systemIcons = {
  water: { icon: Droplets, label: "Água", color: "water" },
  energy: { icon: Zap, label: "Energia", color: "energy" },
  "fixed-line": { icon: Phone, label: "Linha Fixa", color: "fixed-line" },
  mobile: { icon: Smartphone, label: "Celular", color: "mobile" },
};

export function SystemToggleButtons() {
  const { currentSystem, setCurrentSystem, allSystems } = useSystem();

  return (
    <Card className="p-4 bg-gradient-card border-border shadow-card">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Sistema de Gestão
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(allSystems).map(([systemId, config]) => {
            const systemIcon = systemIcons[systemId as keyof typeof systemIcons];
            const isActive = currentSystem === systemId;
            const Icon = systemIcon?.icon || Droplets;

            return (
              <Button
                key={systemId}
                onClick={() => setCurrentSystem(systemId as SystemType)}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={cn(
                  "transition-all duration-300 hover:scale-105",
                  isActive && [
                    systemIcon?.color === "water" && "bg-water text-white hover:bg-water/90",
                    systemIcon?.color === "energy" && "bg-energy text-white hover:bg-energy/90", 
                    systemIcon?.color === "fixed-line" && "bg-fixed-line text-white hover:bg-fixed-line/90",
                    systemIcon?.color === "mobile" && "bg-mobile text-white hover:bg-mobile/90",
                  ],
                  !isActive && [
                    systemIcon?.color === "water" && "border-water/30 text-water hover:bg-water/10",
                    systemIcon?.color === "energy" && "border-energy/30 text-energy hover:bg-energy/10",
                    systemIcon?.color === "fixed-line" && "border-fixed-line/30 text-fixed-line hover:bg-fixed-line/10", 
                    systemIcon?.color === "mobile" && "border-mobile/30 text-mobile hover:bg-mobile/10",
                  ]
                )}
              >
                <Icon className="h-4 w-4 mr-2" />
                {systemIcon?.label || config.name}
              </Button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}