import "reflect-metadata";
import cors from "cors"; // Importe o cors
import { app } from "./app";
import { env } from "./config/env";
import { initializeDataSource } from "./database/data-source";
import { seedAdminUser } from "./database/seed";

async function bootstrap(): Promise<void> {
  // Inicializa o Banco de Dados
  await initializeDataSource();
  
  // Executa o seed do usuário administrador
  await seedAdminUser();

  // Habilita o CORS para permitir que o Frontend (Angular) acesse a API
  // app.use(cors()) libera para qualquer origem, ideal para sua apresentação
  app.use(cors());

  // O Render define a porta automaticamente através da variável PORT. 
  // O env.PORT já deve estar mapeando isso, mas garantimos o fallback para 3333.
  const port = env.PORT || 3333;

  app.listen(port, "0.0.0.0", () => {
    console.log(`Servidor backend online na porta ${port}.`);
  });
}

bootstrap().catch((error) => {
  console.error("Falha ao iniciar o servidor:", error);
  process.exit(1);
});