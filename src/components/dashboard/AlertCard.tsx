import { useState } from "react";
import { AlertTriangle, TrendingUp, TrendingDown, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAlerts } from "@/utils/mockData";

interface AlertCardProps {
  data: any[];
}

export function AlertCard({ data }: AlertCardProps) {
  const [threshold, setThreshold] = useState("20");
  const alerts = getAlerts(data, parseInt(threshold));

  return (
    <Card className="p-6 bg-gradient-card border-border shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Alertas de Consumo</h3>
            <p className="text-sm text-muted-foreground">
              {alerts.length} alertas detectados
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <Select value={threshold} onValueChange={setThreshold}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10%</SelectItem>
              <SelectItem value="15">15%</SelectItem>
              <SelectItem value="20">20%</SelectItem>
              <SelectItem value="25">25%</SelectItem>
              <SelectItem value="30">30%</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum alerta encontrado</p>
            <p className="text-xs">Todas as escolas dentro do limite de {threshold}%</p>
          </div>
        ) : (
          alerts.map((alert: any, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-1 rounded-full ${
                  alert.type === 'increase' 
                    ? 'bg-destructive/10 text-destructive' 
                    : 'bg-success/10 text-success'
                }`}>
                  {alert.type === 'increase' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">
                    {alert.schoolName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {alert.currentConsumption.toFixed(1)}m³ → {alert.previousConsumption.toFixed(1)}m³
                  </p>
                </div>
              </div>
              <Badge 
                variant={alert.type === 'increase' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {alert.variation > 0 ? '+' : ''}{alert.variation}%
              </Badge>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}