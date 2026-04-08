const repositoryMock = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn()
};

jest.mock("../../database/data-source", () => ({
  AppDataSource: {
    getRepository: () => repositoryMock
  }
}));

import { createColaborador, listColaboradores } from "../colaborador.service";

describe("colaborador service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should list colaboradores mapped to API format", async () => {
    repositoryMock.find.mockResolvedValue([
      {
        id: 1,
        nome: "Joao",
        matricula: "M1",
        setor: "Operacao",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-02T00:00:00.000Z")
      }
    ]);

    const result = await listColaboradores();

    expect(result).toEqual([
      {
        id: 1,
        nome: "Joao",
        matricula: "M1",
        setor: "Operacao",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-02T00:00:00.000Z"
      }
    ]);
  });

  it("should throw when matricula already exists", async () => {
    repositoryMock.findOne.mockResolvedValue({ id: 10 });

    await expect(
      createColaborador({ nome: "Ana", matricula: "M2", setor: "RH" })
    ).rejects.toMatchObject({ code: "COLABORADOR_MATRICULA_ALREADY_EXISTS" });
  });

  it("should create colaborador when matricula is new", async () => {
    repositoryMock.findOne.mockResolvedValue(null);
    repositoryMock.create.mockImplementation((input) => input);
    repositoryMock.save.mockResolvedValue({
      id: 2,
      nome: "Ana",
      matricula: "M2",
      setor: "RH",
      createdAt: new Date("2026-03-22T00:00:00.000Z"),
      updatedAt: new Date("2026-03-22T00:00:00.000Z")
    });

    const result = await createColaborador({ nome: "Ana", matricula: "M2", setor: "RH" });

    expect(result.id).toBe(2);
    expect(result.matricula).toBe("M2");
  });
});
