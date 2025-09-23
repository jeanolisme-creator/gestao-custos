import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Droplets, 
  Zap, 
  Phone, 
  Smartphone, 
  ChevronDown, 
  Check 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSystem, SystemType } from '@/contexts/SystemContext';
import { cn } from '@/lib/utils';

const systemIcons = {
  water: Droplets,
  energy: Zap,
  'fixed-line': Phone,
  mobile: Smartphone,
};

const systemColors = {
  water: 'text-water bg-water/10 border-water/20',
  energy: 'text-energy bg-energy/10 border-energy/20',
  'fixed-line': 'text-fixed-line bg-fixed-line/10 border-fixed-line/20',
  mobile: 'text-mobile bg-mobile/10 border-mobile/20',
};

export function SystemSelector() {
  const { currentSystem, setCurrentSystem, allSystems } = useSystem();
  const [isOpen, setIsOpen] = useState(false);

  const currentConfig = allSystems.find(s => s.id === currentSystem)!;
  const CurrentIcon = systemIcons[currentSystem];

  return (
    <div className="mb-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Sistema Ativo</CardTitle>
          <CardDescription>
            Selecione o sistema de gestão que deseja visualizar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between h-12",
                  systemColors[currentSystem]
                )}
              >
                <div className="flex items-center gap-3">
                  <CurrentIcon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">{currentConfig.name}</div>
                    <div className="text-xs opacity-70">
                      Unidade: {currentConfig.unit}
                    </div>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[300px]">
              {allSystems.map((system) => {
                const Icon = systemIcons[system.id];
                const isSelected = system.id === currentSystem;
                
                return (
                  <DropdownMenuItem
                    key={system.id}
                    className="p-3 cursor-pointer"
                    onClick={() => {
                      setCurrentSystem(system.id);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Icon 
                        className={cn(
                          "h-5 w-5",
                          isSelected ? systemColors[system.id].split(' ')[0] : "text-muted-foreground"
                        )} 
                      />
                      <div className="flex-1">
                        <div className="font-medium">{system.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {system.consumptionLabel} • Unidade: {system.unit}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
    </div>
  );
}