import "reflect-metadata";
import { app } from "./app";
import { env } from "./config/env";
import { initializeDataSource } from "./database/data-source";
import { seedAdminUser } from "./database/seed";

async function bootstrap(): Promise<void> {
  await initializeDataSource();
  await seedAdminUser();

  app.listen(env.PORT, () => {
    console.log(`Servidor backend online na porta ${env.PORT}.`);
  });
}

bootstrap().catch((error) => {
  console.error("Falha ao iniciar o servidor:", error);
  process.exit(1);
});
