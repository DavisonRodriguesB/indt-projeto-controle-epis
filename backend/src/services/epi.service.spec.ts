const repositoryMock = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn()
};

jest.mock("../database/data-source", () => ({
  AppDataSource: {
    getRepository: () => repositoryMock
  }
}));

import { createEpi, deleteEpi, getEpiById, listEpis, updateEpi } from "./epi.service";

describe("epi service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function makeEntity(id: number) {
    return {
      id,
      nome: "Capacete",
      ca: "123",
      validade: "2027-12-31",
      estoqueAtual: 10,
      estoqueMinimo: 2,
      createdAt: new Date("2026-03-22T00:00:00.000Z"),
      updatedAt: new Date("2026-03-22T00:00:00.000Z")
    };
  }

  it("should list epis mapped to API format", async () => {
    repositoryMock.find.mockResolvedValue([makeEntity(1)]);

    const result = await listEpis();

    expect(result[0]).toMatchObject({
      id: 1,
      nome: "Capacete",
      estoque_atual: 10,
      estoque_minimo: 2
    });
  });

  it("should return null when epi is not found by id", async () => {
    repositoryMock.findOne.mockResolvedValue(null);

    const result = await getEpiById(99);

    expect(result).toBeNull();
  });

  it("should create and return epi", async () => {
    repositoryMock.create.mockImplementation((input) => input);
    repositoryMock.save.mockResolvedValue(makeEntity(2));

    const result = await createEpi({
      nome: "Luva",
      ca: "777",
      validade: "2028-01-01",
      estoqueAtual: 20,
      estoqueMinimo: 5
    });

    expect(result.id).toBe(2);
    expect(result.nome).toBe("Capacete");
  });

  it("should update epi when found", async () => {
    repositoryMock.findOne.mockResolvedValue(makeEntity(3));
    repositoryMock.save.mockImplementation(async (entity) => entity);

    const result = await updateEpi(3, {
      nome: "Oculos",
      ca: "888",
      validade: "2029-02-02",
      estoqueAtual: 30,
      estoqueMinimo: 8
    });

    expect(result).toMatchObject({
      nome: "Oculos",
      ca: "888",
      estoque_atual: 30,
      estoque_minimo: 8
    });
  });

  it("should return false when delete affects no rows", async () => {
    repositoryMock.delete.mockResolvedValue({ affected: 0 });

    const deleted = await deleteEpi(10);

    expect(deleted).toBe(false);
  });
});
