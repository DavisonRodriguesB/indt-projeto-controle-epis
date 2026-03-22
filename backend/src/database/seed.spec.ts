import { hash } from "bcryptjs";

const repositoryMock = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn()
};

jest.mock("./data-source", () => ({
  AppDataSource: {
    getRepository: () => repositoryMock
  }
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn()
}));

import { seedAdminUser } from "./seed";

describe("seedAdminUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not create admin when it already exists", async () => {
    repositoryMock.findOne.mockResolvedValue({ id: 1, email: "admin@controle-epis.local" });

    await seedAdminUser();

    expect(repositoryMock.findOne).toHaveBeenCalledWith({
      where: { email: "admin@controle-epis.local" }
    });
    expect(hash).not.toHaveBeenCalled();
    expect(repositoryMock.create).not.toHaveBeenCalled();
    expect(repositoryMock.save).not.toHaveBeenCalled();
  });

  it("should create admin when it does not exist", async () => {
    repositoryMock.findOne.mockResolvedValue(null);
    (hash as jest.Mock).mockResolvedValue("hashed-password");
    repositoryMock.create.mockImplementation((input) => input);
    repositoryMock.save.mockResolvedValue({ id: 2 });

    await seedAdminUser();

    expect(hash).toHaveBeenCalledWith("admin123", 10);
    expect(repositoryMock.create).toHaveBeenCalledWith({
      nome: "Administrador",
      email: "admin@controle-epis.local",
      senhaHash: "hashed-password",
      role: "admin"
    });
    expect(repositoryMock.save).toHaveBeenCalledTimes(1);
  });
});
