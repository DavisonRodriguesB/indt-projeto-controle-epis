export interface Epi {
  id: number;
  nome: string;
  ca: string;
  validade: string;
  estoque_atual: number;
  estoque_minimo: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEpiInput {
  nome: string;
  ca: string;
  validade: string;
  estoqueAtual: number;
  estoqueMinimo: number;
}

export interface UpdateEpiInput extends CreateEpiInput {}
