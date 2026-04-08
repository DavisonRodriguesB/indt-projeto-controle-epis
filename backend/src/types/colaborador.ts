export interface Colaborador {
  id: number;
  nome: string;
  matricula: string;
  setor?: string;
  cargo_id: number;
  setor_id: number;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateColaboradorInput {
  nome: string;
  matricula: string;
  setor?: string;
  cargoId?: number;
  setorId?: number;
}

export interface UpdateColaboradorInput extends CreateColaboradorInput {
  status?: boolean;
}
