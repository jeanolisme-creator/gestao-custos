import { DataImport } from "@/components/school-demand/DataImport";

export default function SchoolDemandImport() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Importar Dados - Demanda Escolar
            </h1>
            <p className="text-muted-foreground">
              Importe dados de escolas e alunos através de arquivos CSV, Excel ou PDF
            </p>
          </div>
        </div>
        <DataImport />
      </div>
    </div>
  );
}