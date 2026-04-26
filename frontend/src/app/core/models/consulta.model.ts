export interface EntregaItem {
  id: number;
  nome: string;
  quantidade: number;
  numero_ca: string;
  codigo_material: string;
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