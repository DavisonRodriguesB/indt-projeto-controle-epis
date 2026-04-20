export interface BaseItem {
  id?: number;
  descricao: string;
  ativo: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}