export interface RelatorioEpiData {
  protocolo: string;
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