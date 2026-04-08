import request from "supertest";
import { app } from "../app";
import { seedAdminUser } from "../database/seed";
import { AppDataSource, initializeDataSource } from "../database/data-source";

describe("fluxos de endpoints (docker backend)", () => {
  const api = request(app);

  beforeAll(async () => {
    await initializeDataSource();
    await seedAdminUser();
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  function expectStepStatus(step: string, status: number, expected: number, body: unknown): void {
    const debug = `${step} esperado ${expected}, recebido ${status}. body=${JSON.stringify(body)}`;
    if (status !== expected) {
      throw new Error(debug);
    }
    expect(status).toBe(expected);
  }

  it("should execute base cadastros, colaboradores, epis, movimentacoes e consulta", async () => {
    const suffix = `${Date.now()}`.slice(-6);

    const health = await api.get("/api/health");
    expectStepStatus("health", health.status, 200, health.body);

    const login = await api.post("/api/auth/login").send({
      email: "admin@controle-epis.local",
      senha: "admin123"
    });
    expectStepStatus("login", login.status, 200, login.body);

    const token = login.body?.data?.token as string | undefined;
    expect(token).toBeTruthy();
    const authHeader = { Authorization: `Bearer ${token}` };

    const cargo = await api.post("/api/cargos").set(authHeader).send({ descricao: `Cargo Smoke ${suffix}` });
    expectStepStatus("create cargo", cargo.status, 201, cargo.body);
    const cargoId = cargo.body?.data?.id as number;

    const setor = await api.post("/api/setores").set(authHeader).send({ descricao: `Setor Smoke ${suffix}` });
    expectStepStatus("create setor", setor.status, 201, setor.body);
    const setorId = setor.body?.data?.id as number;

    const categoria = await api.post("/api/categorias").set(authHeader).send({ descricao: `Categoria Smoke ${suffix}` });
    expectStepStatus("create categoria", categoria.status, 201, categoria.body);
    const categoriaId = categoria.body?.data?.id as number;

    const colaborador = await api
      .post("/api/colaboradores")
      .set(authHeader)
      .send({
        nome: `Colab Smoke ${suffix}`,
        matricula: `SMK-${suffix}`,
        cargoId,
        setorId,
        status: true
      });
    expectStepStatus("create colaborador", colaborador.status, 201, colaborador.body);
    const colaboradorId = colaborador.body?.data?.id as number;

    const epi = await api
      .post("/api/epis")
      .set(authHeader)
      .send({
        codigo: `EPI-${suffix}`,
        nome: `EPI Smoke ${suffix}`,
        ca: `CA-${suffix}`,
        categoriaId,
        vidaUtilDias: 365,
        ativo: true,
        validade: "2027-12-31",
        estoqueAtual: 30,
        estoqueMinimo: 5
      });
    expectStepStatus("create epi", epi.status, 201, epi.body);
    const epiId = epi.body?.data?.id as number;

    const entradaSaldo = await api
      .post("/api/movimentacoes/entrada-saldo")
      .set(authHeader)
      .send({
        itens: [{ epiId, quantidade: 10 }],
        dataMovimentacao: "2026-04-07",
        observacao: "Entrada smoke test"
      });
    expectStepStatus("mov entrada saldo", entradaSaldo.status, 201, entradaSaldo.body);

    const entrega = await api
      .post("/api/movimentacoes/entrega")
      .set(authHeader)
      .send({
        colaboradorId,
        itens: [{ epiId, quantidade: 2 }],
        dataMovimentacao: "2026-04-07",
        observacao: "Entrega smoke test"
      });
    expectStepStatus("mov entrega", entrega.status, 201, entrega.body);

    const consulta = await api
      .get(`/api/consultas/entregas?colaborador_id=${colaboradorId}`)
      .set(authHeader);
    expectStepStatus("consulta entregas", consulta.status, 200, consulta.body);

    expect(typeof consulta.body?.meta?.total).toBe("number");
    expect(consulta.body.meta.total).toBeGreaterThanOrEqual(1);
  });
});
