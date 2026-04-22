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

export interface AlertaEventoRecente {
  eventId: string;
  eventType: "movimentacao_entrega" | "movimentacao_entrada_saldo" | "novo_colaborador" | "novo_epi";
  title: string;
  description: string;
  eventAt: string;
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

export async function listEventosRecentes(
  authUser: AuthUser,
  limite = 8
): Promise<AlertaEventoRecente[]> {
  const limiteSeguro = Math.min(Math.max(limite, 1), 50);
  const whereRole = authUser.role === "almoxarife" ? "WHERE m.usuario_id = $2" : "";
  const movementParams = authUser.role === "almoxarife" ? [limiteSeguro, authUser.id] : [limiteSeguro];

  const movementRows = await AppDataSource.query(
    `
      SELECT
        m.id,
        m.tipo,
        COALESCE(m.data_movimentacao::timestamp, m.created_at) AS event_at,
        m.usuario_id,
        u.nome AS usuario_nome,
        c.nome AS colaborador_nome,
        COUNT(mi.id)::int AS total_itens,
        COALESCE(SUM(mi.quantidade), 0)::int AS total_quantidade
      FROM movimentacoes m
      INNER JOIN users u ON u.id = m.usuario_id
      LEFT JOIN colaboradores c ON c.id = m.colaborador_id
      LEFT JOIN movimentacao_itens mi ON mi.movimentacao_id = m.id
      ${whereRole}
      GROUP BY m.id, u.nome, c.nome
      ORDER BY COALESCE(m.data_movimentacao::timestamp, m.created_at) DESC, m.id DESC
      LIMIT $1
    `,
    movementParams
  );

  const collaboratorRows = await AppDataSource.query(
    `
      SELECT id, nome, matricula, created_at
      FROM colaboradores
      ORDER BY created_at DESC, id DESC
      LIMIT $1
    `,
    [limiteSeguro]
  );

  const epiRows = await AppDataSource.query(
    `
      SELECT id, nome, codigo, created_at
      FROM epis
      ORDER BY created_at DESC, id DESC
      LIMIT $1
    `,
    [limiteSeguro]
  );

  const movementEvents: AlertaEventoRecente[] = movementRows.map((row: Record<string, unknown>) => {
    const tipo = String(row.tipo) as "entrega" | "entrada_saldo";
    const destino = row.colaborador_nome ? ` para ${String(row.colaborador_nome)}` : "";
    const totalItens = Number(row.total_itens);
    const totalQuantidade = Number(row.total_quantidade);
    const totalItensLabel = totalItens === 1 ? "item" : "itens";

    return {
      eventId: `mov-${String(row.id)}`,
      eventType: tipo === "entrega" ? "movimentacao_entrega" : "movimentacao_entrada_saldo",
      title: tipo === "entrega" ? "Entrega de EPI" : "Entrada de saldo",
      description: `${String(row.usuario_nome)}${destino} (${totalItens} ${totalItensLabel}, qtd ${totalQuantidade})`,
      eventAt: new Date(String(row.event_at)).toISOString()
    };
  });

  const collaboratorEvents: AlertaEventoRecente[] = collaboratorRows.map((row: Record<string, unknown>) => ({
    eventId: `col-${String(row.id)}`,
    eventType: "novo_colaborador",
    title: "Novo colaborador",
    description: `${String(row.nome)} (${String(row.matricula)}) cadastrado.`,
    eventAt: new Date(String(row.created_at)).toISOString()
  }));

  const epiEvents: AlertaEventoRecente[] = epiRows.map((row: Record<string, unknown>) => ({
    eventId: `epi-${String(row.id)}`,
    eventType: "novo_epi",
    title: "Novo EPI",
    description: `${String(row.nome)} (${String(row.codigo)}) cadastrado.`,
    eventAt: new Date(String(row.created_at)).toISOString()
  }));

  return [...movementEvents, ...collaboratorEvents, ...epiEvents]
    .sort((a, b) => new Date(b.eventAt).getTime() - new Date(a.eventAt).getTime())
    .slice(0, limiteSeguro);
}
