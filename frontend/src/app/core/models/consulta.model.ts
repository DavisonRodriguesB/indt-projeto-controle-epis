export interface EntregaItem {
  nome: string;
  numero_ca: string;
  quantidade: number;
}

export interface EntregaCompleta {
  id: string; 
  colaborador: string;
  matricula: string;
  setor: string;
  cargo: string;
  data_hora: string;
  usuario_emissor: string;
  total_itens: number;
  itens: EntregaItem[];
}