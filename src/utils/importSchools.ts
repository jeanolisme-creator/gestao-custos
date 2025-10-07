import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

export async function importSchoolsFromCSV() {
  try {
    // Fetch the CSV file
    const response = await fetch('/data/schools_import.csv');
    const csvText = await response.text();
    
    // Parse CSV
    const workbook = XLSX.read(csvText, { type: 'string' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet) as any[];
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Usuário não autenticado");
    }
    
    // Process and prepare data for insertion
    const schoolsToImport = jsonData.map((row: any) => {
      const alunos_creche = parseInt(row.alunos_creche || "0") || 0;
      const alunos_infantil = parseInt(row.alunos_infantil || "0") || 0;
      const alunos_fundamental_i = parseInt(row.alunos_fundamental_i || "0") || 0;
      const alunos_fundamental_ii = parseInt(row.alunos_fundamental_ii || "0") || 0;
      
      return {
        user_id: user.id,
        nome_escola: row.nome_escola || "",
        proprietario: row.proprietario || null,
        endereco_completo: row.endereco_completo || null,
        numero: row.numero || null,
        bairro: row.bairro || null,
        macroregiao: row.macroregiao === 'nan' ? null : (row.macroregiao || null),
        telefone_fixo: row.telefone_fixo || null,
        telefone_celular: (row.telefone_celular === 'NULL' || row.telefone_celular === 'nan') ? null : (row.telefone_celular || null),
        tipo_escola: row.tipo_escola || null,
        email: row.email || null,
        alunos_creche,
        alunos_infantil,
        alunos_fundamental_i,
        alunos_fundamental_ii,
      };
    }).filter(school => school.nome_escola); // Only import schools with names
    
    // Insert data in batches to avoid timeout
    const batchSize = 50;
    let totalInserted = 0;
    
    for (let i = 0; i < schoolsToImport.length; i += batchSize) {
      const batch = schoolsToImport.slice(i, i + batchSize);
      const { error } = await supabase.from("schools").insert(batch);
      
      if (error) throw error;
      totalInserted += batch.length;
    }
    
    return {
      success: true,
      count: totalInserted,
      message: `${totalInserted} escolas importadas com sucesso!`
    };
  } catch (error) {
    console.error("Error importing schools:", error);
    return {
      success: false,
      count: 0,
      message: error instanceof Error ? error.message : "Erro ao importar escolas"
    };
  }
}
