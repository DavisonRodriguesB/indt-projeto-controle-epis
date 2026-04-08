const initializeDataSourceMock = jest.fn();
const seedAdminUserMock = jest.fn();

jest.mock("../data-source", () => ({
  initializeDataSource: () => initializeDataSourceMock(),
  AppDataSource: {
    isInitialized: false,
    destroy: jest.fn()
  }
}));

jest.mock("../seed", () => ({
  seedAdminUser: () => seedAdminUserMock()
}));

import { runMigrations } from "../migrate";

describe("runMigrations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize datasource and run seed", async () => {
    initializeDataSourceMock.mockResolvedValue(undefined);
    seedAdminUserMock.mockResolvedValue(undefined);

    await runMigrations();

    expect(initializeDataSourceMock).toHaveBeenCalledTimes(1);
    expect(seedAdminUserMock).toHaveBeenCalledTimes(1);
  });

  it("should propagate initializeDataSource error", async () => {
    initializeDataSourceMock.mockRejectedValue(new Error("init-failed"));

    await expect(runMigrations()).rejects.toThrow("init-failed");
    expect(seedAdminUserMock).not.toHaveBeenCalled();
  });
});
