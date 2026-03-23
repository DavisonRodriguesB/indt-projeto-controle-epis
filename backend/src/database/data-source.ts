import { DataSource } from "typeorm";
import { env } from "../config/env";
import { ColaboradorEntity } from "../entities/colaborador.entity";
import { EntregaEntity } from "../entities/entrega.entity";
import { EpiEntity } from "../entities/epi.entity";
import { UserEntity } from "../entities/user.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  entities: [EpiEntity, UserEntity, ColaboradorEntity, EntregaEntity],
  synchronize: env.TYPEORM_SYNCHRONIZE,
  logging: false
});

export async function initializeDataSource(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}
