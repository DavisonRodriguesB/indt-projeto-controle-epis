export interface Entrega {
  id: number;
  colaborador_id: number;
  epi_id: number;
  usuario_id: number;
  quantidade: number;
  data_entrega: string;
  observacao: string | null;
  created_at: string;
  updated_at: string;
}

export interface EntregaListItem {
  id: number;
  quantidade: number;
  data_entrega: string;
  observacao: string | null;
  colaborador: {
    id: number;
    nome: string;
    matricula: string;
    setor?: string;
    setor_id: number;
  };
  epi: {
    id: number;
    nome: string;
    ca: string;
  };
  usuario: {
    id: number;
    nome: string;
    email: string;
    role: string;
  };
}

export interface CreateEntregaInput {
  colaboradorId: number;
  epiId: number;
  quantidade: number;
  dataEntrega?: string;
  observacao?: string;
}
