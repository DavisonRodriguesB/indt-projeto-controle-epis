export interface Colaborador {
  id: number;
  nome: string;
  matricula: string;
  setor: string;
  created_at: string;
  updated_at: string;
}

export interface CreateColaboradorInput {
  nome: string;
  matricula: string;
  setor: string;
}
