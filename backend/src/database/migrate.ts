import "reflect-metadata";
import { initializeDataSource, AppDataSource } from "./data-source";
import { seedAdminUser } from "./seed";

export async function runMigrations(): Promise<void> {
  await initializeDataSource();
  await seedAdminUser();
}

if (require.main === module) {
  runMigrations()
    .then(async () => {
      console.log("Schema sincronizado com TypeORM e seed executado com sucesso.");
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
      }
    })
    .catch((error) => {
      console.error("Erro ao sincronizar schema/seed:", error);
      process.exitCode = 1;
    });
}
