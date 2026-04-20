import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../app";
import { env } from "../config/env";
import { createBaseItem } from "../services/cadastros-base.service";
import { createColaborador } from "../services/colaborador.service";
import { createEpi } from "../services/epi.service";
import { createEntradaSaldoMovimentacao, createEntregaMovimentacao } from "../services/movimentacao.service";
import { consultaEntregas } from "../services/consulta-entregas.service";

jest.mock("../services/cadastros-base.service", () => ({
  createBaseItem: jest.fn(),
  listBaseItems: jest.fn(),
  updateBaseItem: jest.fn()
}));

jest.mock("../services/colaborador.service", () => ({
  createColaborador: jest.fn(),
  listColaboradores: jest.fn(),
  updateColaborador: jest.fn(),
  deleteColaborador: jest.fn()
}));

jest.mock("../services/epi.service", () => ({
  createEpi: jest.fn(),
  listEpis: jest.fn(),
  getEpiById: jest.fn(),
  updateEpi: jest.fn(),
  entradaSaldoEpi: jest.fn(),
  deleteEpi: jest.fn()
}));

jest.mock("../services/movimentacao.service", () => ({
  createEntradaSaldoMovimentacao: jest.fn(),
  createEntregaMovimentacao: jest.fn()
}));

jest.mock("../services/consulta-entregas.service", () => ({
  consultaEntregas: jest.fn()
}));

describe("fluxos de endpoints (contrato de rota sem banco)", () => {
  const api = request(app);
  const createBaseItemMock = createBaseItem as jest.MockedFunction<typeof createBaseItem>;
  const createColaboradorMock = createColaborador as jest.MockedFunction<typeof createColaborador>;
  const createEpiMock = createEpi as jest.MockedFunction<typeof createEpi>;
  const createEntradaSaldoMovimentacaoMock = createEntradaSaldoMovimentacao as jest.MockedFunction<typeof createEntradaSaldoMovimentacao>;
  const createEntregaMovimentacaoMock = createEntregaMovimentacao as jest.MockedFunction<typeof createEntregaMovimentacao>;
  const consultaEntregasMock = consultaEntregas as jest.MockedFunction<typeof consultaEntregas>;

  const baseItemMock = { id: 1, descricao: "Mock Base", ativo: true };
  const colaboradorMock = {
    id: 1,
    nome: "Colaborador Mock",
    matricula: "MAT-001",
    setor: undefined,
    cargo_id: 1,
    setor_id: 1,
    status: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z"
  };
  const epiMock = {
    id: 1,
    codigo: "EPI-001",
    nome: "Luva Mock",
    ca: "CA-001",
    categoria_id: 1,
    vida_util_dias: 365,
    ativo: true,
    pode_editar: true,
    validade: "2027-12-31",
    estoque_atual: 10,
    estoque_minimo: 2,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z"
  };
  const movimentacaoMock = { id: 101 };
  const consultaRowsMock = [
    {
      movimentacao_id: 101,
      colaborador_nome: "Colaborador Mock",
      epi_nome: "Luva Mock",
      quantidade: 1
    }
  ];

  beforeEach(() => {
    createBaseItemMock.mockReset();
    createColaboradorMock.mockReset();
    createEpiMock.mockReset();
    createEntradaSaldoMovimentacaoMock.mockReset();
    createEntregaMovimentacaoMock.mockReset();
    consultaEntregasMock.mockReset();
  });

  function getAuthHeader(): { Authorization: string } {
    const tokenFromEnv = process.env.TEST_AUTH_TOKEN;

    if (tokenFromEnv) {
      return { Authorization: `Bearer ${tokenFromEnv}` };
    }

    const token = jwt.sign(
      {
        role: "admin",
        nome: "Teste CI",
        email: "teste-ci@controle-epis.local"
      },
      env.JWT_SECRET,
      {
        subject: "1",
        expiresIn: "1h"
      }
    );

    return { Authorization: `Bearer ${token}` };
  }

  it("deve manter health ativo", async () => {
    const health = await api.get("/api/health");
    expect(health.status).toBe(200);
    expect(health.body).toEqual({ data: { status: "ok" } });
  });

  it("deve validar payload invalido de login", async () => {
    const login = await api.post("/api/auth/login").send({
      email: "invalido",
      senha: "123"
    });

    expect(login.status).toBe(400);
    expect(login.body.code).toBe("VALIDATION_ERROR");
  });

  it("deve exigir token quando ausente", async () => {
    const response = await api.post("/api/cadastro/cargos").send({ descricao: "Cargo Teste" });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("AUTH_TOKEN_MISSING");
  });

  it("deve criar cargo com dados mockados", async () => {
    createBaseItemMock.mockResolvedValue(baseItemMock);

    const response = await api.post("/api/cadastro/cargos").set(getAuthHeader()).send({ descricao: "Cargo Mock" });

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual(baseItemMock);
    expect(createBaseItemMock).toHaveBeenCalledWith("cargos", "Cargo Mock");
  });

  it("deve criar colaborador com dados mockados", async () => {
    createColaboradorMock.mockResolvedValue(colaboradorMock);

    const response = await api.post("/api/colaboradores").set(getAuthHeader()).send({
      nome: "Colaborador Mock",
      matricula: "MAT-001",
      cargoId: 1,
      setorId: 1,
      status: true
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual(colaboradorMock);
  });

  it("deve criar epi com dados mockados", async () => {
    createEpiMock.mockResolvedValue(epiMock);

    const response = await api.post("/api/epis").set(getAuthHeader()).send({
      codigo: "EPI-001",
      nome: "Luva Mock",
      ca: "CA-001",
      categoriaId: 1,
      vidaUtilDias: 365,
      ativo: true,
      validade: "2027-12-31",
      estoqueAtual: 10,
      estoqueMinimo: 2
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual(epiMock);
  });

  it("deve criar movimentacao de entrada de saldo com dados mockados", async () => {
    createEntradaSaldoMovimentacaoMock.mockResolvedValue(movimentacaoMock);

    const response = await api.post("/api/movimentacoes/entrada-saldo").set(getAuthHeader()).send({
      itens: [{ epiId: 1, quantidade: 2 }],
      dataMovimentacao: "2026-04-07",
      observacao: "entrada mock"
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual(movimentacaoMock);
  });

  it("deve criar movimentacao de entrega com dados mockados", async () => {
    createEntregaMovimentacaoMock.mockResolvedValue(movimentacaoMock);

    const response = await api.post("/api/movimentacoes/entrega").set(getAuthHeader()).send({
      colaboradorId: 1,
      itens: [{ epiId: 1, quantidade: 1 }],
      dataMovimentacao: "2026-04-07",
      observacao: "entrega mock"
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual(movimentacaoMock);
  });

  it("deve retornar consulta de entregas com dados mockados", async () => {
    consultaEntregasMock.mockResolvedValue(consultaRowsMock);

    const response = await api
      .get("/api/consultas/entregas?colaborador_id=1")
      .set(getAuthHeader());

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(consultaRowsMock);
    expect(response.body.meta).toEqual({ total: 1 });
  });
});
