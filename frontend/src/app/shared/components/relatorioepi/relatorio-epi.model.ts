export interface RelatorioEpiData {
  colaborador: string;
  funcao: string;
  setor: string;
  dataEntrega: Date;
  usuarioSistema: string;
  itens: Array<{
    codigo: string;
    material: string;
    ca: string;
    quantidade: number;
  }>;
}