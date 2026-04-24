export interface RelatorioEpiData {
  protocolo: string;
  colaborador: string;
  funcao: any;
  setor: any;
  dataEntrega: Date;
  usuarioSistema: string;
  itens: Array<{
    codigo: string;
    material: string;
    ca: string;
    quantidade: number;
  }>;
}