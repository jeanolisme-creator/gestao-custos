import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PendingSchoolsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPending: (month: string, schoolIndex: number) => void;
}

interface PendingData {
  [month: string]: number[];
}

export function PendingSchools({ open, onOpenChange, onSelectPending }: PendingSchoolsProps) {
  const [pendingData, setPendingData] = useState<PendingData>({});

  useEffect(() => {
    if (open) {
      loadPendingData();
    }
  }, [open]);

  const loadPendingData = () => {
    const stored = localStorage.getItem('water_pending_schools');
    if (stored) {
      setPendingData(JSON.parse(stored));
    }
  };

  const hasPendingSchools = Object.keys(pendingData).length > 0 && 
    Object.values(pendingData).some(arr => arr.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Escolas Pendentes - Dados Mensais</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!hasPendingSchools ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Não há escolas pendentes no momento.
              </AlertDescription>
            </Alert>
          ) : (
            Object.entries(pendingData).map(([month, schoolIndices]) => {
              if (schoolIndices.length === 0) return null;
              
              return (
                <Card key={month} className="p-4">
                  <h3 className="font-semibold text-lg mb-3">{month}</h3>
                  <div className="space-y-2">
                    {schoolIndices.map((schoolIndex) => {
                      // Get school name from localStorage
                      const schoolsStr = localStorage.getItem('cached_schools');
                      let schoolName = `Escola #${schoolIndex + 1}`;
                      
                      if (schoolsStr) {
                        try {
                          const schools = JSON.parse(schoolsStr);
                          if (schools[schoolIndex]) {
                            schoolName = schools[schoolIndex].nome_escola;
                          }
                        } catch (e) {
                          console.error('Error parsing schools:', e);
                        }
                      }

                      return (
                        <div
                          key={schoolIndex}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => {
                            onSelectPending(month, schoolIndex);
                            onOpenChange(false);
                          }}
                        >
                          <div>
                            <p className="font-medium">{schoolName}</p>
                            <p className="text-sm text-muted-foreground">
                              Posição: {schoolIndex + 1}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
