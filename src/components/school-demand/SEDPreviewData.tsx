// Mock data example of what SED-SP API might return
export const sedSpMockData = [
  {
    codigo_escola: "35001001",
    nome: "EMEF Prof. João Silva",
    endereco: "Rua das Flores, 123",
    numero: "123",
    bairro: "Centro",
    macroregiao: "Central",
    telefone: "(11) 3333-1111",
    email: "joaosilva.emef@educacao.sp.gov.br",
    alunos: {
      creche: 45,
      infantil: 85,
      fundamental_i: 240,
      fundamental_ii: 180
    },
    alunos_por_turma: 28,
    ultima_atualizacao: "2025-01-15T10:30:00Z"
  },
  {
    codigo_escola: "35001002",
    nome: "EMEI Maria das Dores",
    endereco: "Av. Paulista, 456",
    numero: "456",
    bairro: "Vila Toninho",
    macroregiao: "Vila Toninho",
    telefone: "(11) 3333-2222",
    email: "mariadores.emei@educacao.sp.gov.br",
    alunos: {
      creche: 120,
      infantil: 95,
      fundamental_i: 0,
      fundamental_ii: 0
    },
    alunos_por_turma: 25,
    ultima_atualizacao: "2025-01-14T15:45:00Z"
  },
  {
    codigo_escola: "35001003", 
    nome: "EMEF Dr. Antonio Santos",
    endereco: "Rua da Esperança, 789",
    numero: "789",
    bairro: "Pinheirinho",
    macroregiao: "Pinheirinho",
    telefone: "(11) 3333-3333",
    email: "antoniosantos.emef@educacao.sp.gov.br",
    alunos: {
      creche: 0,
      infantil: 0,
      fundamental_i: 320,
      fundamental_ii: 280
    },
    alunos_por_turma: 30,
    ultima_atualizacao: "2025-01-15T09:15:00Z"
  },
  {
    codigo_escola: "35001004",
    nome: "EMEB Professora Ana Lima",
    endereco: "Rua do Bosque, 321",
    numero: "321", 
    bairro: "Bosque",
    macroregiao: "Bosque",
    telefone: "(11) 3333-4444",
    email: "analima.emeb@educacao.sp.gov.br",
    alunos: {
      creche: 60,
      infantil: 75,
      fundamental_i: 150,
      fundamental_ii: 120
    },
    alunos_por_turma: 26,
    ultima_atualizacao: "2025-01-15T11:20:00Z"
  },
  {
    codigo_escola: "35001005",
    nome: "EMEF Carlos Drummond de Andrade",
    endereco: "Rua dos Poetas, 555",
    numero: "555",
    bairro: "Schmidt",
    macroregiao: "Schmidt", 
    telefone: "(11) 3333-5555",
    email: "drummond.emef@educacao.sp.gov.br",
    alunos: {
      creche: 0,
      infantil: 0,
      fundamental_i: 280,
      fundamental_ii: 350
    },
    alunos_por_turma: 32,
    ultima_atualizacao: "2025-01-14T16:10:00Z"
  }
];

export const calculateSEDTotals = () => {
  const totals = sedSpMockData.reduce((acc, escola) => {
    acc.creche += escola.alunos.creche;
    acc.infantil += escola.alunos.infantil;
    acc.fundamental_i += escola.alunos.fundamental_i;
    acc.fundamental_ii += escola.alunos.fundamental_ii;
    acc.escolas += 1;
    return acc;
  }, {
    creche: 0,
    infantil: 0,
    fundamental_i: 0,
    fundamental_ii: 0,
    escolas: 0
  });

  return {
    ...totals,
    total_alunos: totals.creche + totals.infantil + totals.fundamental_i + totals.fundamental_ii
  };
};