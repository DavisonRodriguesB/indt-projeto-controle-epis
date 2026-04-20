import { AppDataSource } from "../database/data-source";
import { AuthUser } from "../types/auth";

interface AlertaValidade {
  id: number;
  nome: string;
  ca: string;
  validade: string;
  diasParaVencer: number;
  status: "vencido" | "vence_em_breve";
}

interface AlertaEstoque {
  id: number;
  nome: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  faltaParaMinimo: number;
}

interface AlertasResult {
  validade: AlertaValidade[];
  estoqueMinimo: AlertaEstoque[];
}

interface AlertaMovimentacao {
  id: number;
  tipo: "entrega" | "entrada_saldo";
  dataMovimentacao: string;
  observacao: string | null;
  usuarioId: number;
  usuarioNome: string;
  colaboradorId: number | null;
  colaboradorNome: string | null;
  totalItens: number;
  totalQuantidade: number;
}

export async function listAlertas(diasValidade = 30): Promise<AlertasResult> {
  const validadeRows = await AppDataSource.query(
    `
      SELECT
        id,
        nome,
        ca,
        validade,
        (validade - CURRENT_DATE) AS dias_para_vencer
      FROM epis
      WHERE validade <= CURRENT_DATE + $1::int
      ORDER BY validade ASC
    `,
    [diasValidade]
  );

  const estoqueRows = await AppDataSource.query(
    `
      SELECT id, nome, estoque_atual, estoque_minimo
      FROM epis
      WHERE estoque_atual <= estoque_minimo
      ORDER BY (estoque_minimo - estoque_atual) DESC, nome ASC
    `
  );

  return {
    validade: validadeRows.map((row: Record<string, unknown>) => {
      const dias = Number(row.dias_para_vencer);

      return {
        id: Number(row.id),
        nome: String(row.nome),
        ca: String(row.ca),
        validade: String(row.validade),
        diasParaVencer: dias,
        status: dias < 0 ? "vencido" : "vence_em_breve"
      };
    }),
    estoqueMinimo: estoqueRows.map((row: Record<string, unknown>) => ({
      id: Number(row.id),
      nome: String(row.nome),
      estoqueAtual: Number(row.estoque_atual),
      estoqueMinimo: Number(row.estoque_minimo),
      faltaParaMinimo: Number(row.estoque_minimo) - Number(row.estoque_atual)
    }))
  };
}

export async function listMovimentacoesRecentes(
  authUser: AuthUser,
  limite = 8
): Promise<AlertaMovimentacao[]> {
  const limiteSeguro = Math.min(Math.max(limite, 1), 50);
  const whereRole = authUser.role === "almoxarife" ? "WHERE m.usuario_id = $2" : "";
  const params = authUser.role === "almoxarife" ? [limiteSeguro, authUser.id] : [limiteSeguro];

  const rows = await AppDataSource.query(
    `
      SELECT
        m.id,
        m.tipo,
        m.data_movimentacao,
        m.observacao,
        m.usuario_id,
        u.nome AS usuario_nome,
        m.colaborador_id,
        c.nome AS colaborador_nome,
        COUNT(mi.id)::int AS total_itens,
        COALESCE(SUM(mi.quantidade), 0)::int AS total_quantidade
      FROM movimentacoes m
      INNER JOIN users u ON u.id = m.usuario_id
      LEFT JOIN colaboradores c ON c.id = m.colaborador_id
      LEFT JOIN movimentacao_itens mi ON mi.movimentacao_id = m.id
      ${whereRole}
      GROUP BY m.id, u.nome, c.nome
      ORDER BY m.data_movimentacao DESC, m.id DESC
      LIMIT $1
    `,
    params
  );

  return rows.map((row: Record<string, unknown>) => ({
    id: Number(row.id),
    tipo: String(row.tipo) as "entrega" | "entrada_saldo",
    dataMovimentacao: String(row.data_movimentacao),
    observacao: row.observacao ? String(row.observacao) : null,
    usuarioId: Number(row.usuario_id),
    usuarioNome: String(row.usuario_nome),
    colaboradorId: row.colaborador_id ? Number(row.colaborador_id) : null,
    colaboradorNome: row.colaborador_nome ? String(row.colaborador_nome) : null,
    totalItens: Number(row.total_itens),
    totalQuantidade: Number(row.total_quantidade)
  }));
}
