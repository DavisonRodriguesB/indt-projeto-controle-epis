export interface Epi {
  id: number;
  codigo: string;
  nome: string;
  ca: string;
  categoria: string;
  categoria_id: number;
  vida_util_dias: number;
  ativo: boolean;
  pode_editar: boolean;
  validade: string;
  estoque_atual: number;
  estoque_minimo: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEpiInput {
  codigo?: string;
  nome: string;
  ca: string;
  categoriaId?: number;
  vidaUtilDias?: number;
  ativo?: boolean;
  validade: string;
  estoqueAtual: number;
  estoqueMinimo: number;
}

export interface UpdateEpiInput extends Partial<CreateEpiInput> {}

export interface ListEpisInput {
  page: number;
  pageSize: number;
}