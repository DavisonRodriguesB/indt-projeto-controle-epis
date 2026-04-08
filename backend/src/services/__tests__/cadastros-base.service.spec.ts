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

import { createBaseItem, listBaseItems, updateBaseItem } from "../cadastros-base.service";

describe("cadastros-base service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should list active base items mapped to API shape", async () => {
    repositoryMock.find.mockResolvedValue([
      { id: 1, descricao: "Cargo A", ativo: true },
      { id: 2, descricao: "Cargo B", ativo: true }
    ]);

    const result = await listBaseItems("cargos");

    expect(repositoryMock.find).toHaveBeenCalledWith({ where: { ativo: true }, order: { id: "ASC" } });
    expect(result).toEqual([
      { id: 1, descricao: "Cargo A", ativo: true },
      { id: 2, descricao: "Cargo B", ativo: true }
    ]);
  });

  it("should throw BASE_ITEM_ALREADY_EXISTS when creating duplicated descricao", async () => {
    repositoryMock.findOne.mockResolvedValue({ id: 10, descricao: "Duplicado", ativo: true });

    await expect(createBaseItem("setores", "Duplicado")).rejects.toMatchObject({ code: "BASE_ITEM_ALREADY_EXISTS" });
  });

  it("should create base item with trimmed descricao", async () => {
    repositoryMock.findOne.mockResolvedValue(null);
    repositoryMock.create.mockImplementation((input) => input);
    repositoryMock.save.mockResolvedValue({ id: 7, descricao: "Novo Setor", ativo: true });

    const result = await createBaseItem("setores", "  Novo Setor  ");

    expect(repositoryMock.create).toHaveBeenCalledWith({ descricao: "Novo Setor", ativo: true });
    expect(result).toEqual({ id: 7, descricao: "Novo Setor", ativo: true });
  });

  it("should return null on update when id does not exist", async () => {
    repositoryMock.findOne.mockResolvedValueOnce(null);

    const result = await updateBaseItem("categorias", 123, "Nova", true);

    expect(result).toBeNull();
  });

  it("should throw BASE_ITEM_ALREADY_EXISTS when update finds duplicate id", async () => {
    repositoryMock.findOne
      .mockResolvedValueOnce({ id: 8, descricao: "Atual", ativo: true })
      .mockResolvedValueOnce({ id: 99, descricao: "Duplicada", ativo: true });

    await expect(updateBaseItem("cargos", 8, "Duplicada")).rejects.toMatchObject({ code: "BASE_ITEM_ALREADY_EXISTS" });
  });

  it("should update descricao and ativo when row exists", async () => {
    const row = { id: 8, descricao: "Antiga", ativo: true };
    repositoryMock.findOne
      .mockResolvedValueOnce(row)
      .mockResolvedValueOnce(null);
    repositoryMock.save.mockResolvedValue({ id: 8, descricao: "Nova", ativo: false });

    const result = await updateBaseItem("cargos", 8, "  Nova ", false);

    expect(repositoryMock.save).toHaveBeenCalled();
    expect(result).toEqual({ id: 8, descricao: "Nova", ativo: false });
  });
});
