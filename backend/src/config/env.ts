import dotenv from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env" });
}

const isProduction = process.env.NODE_ENV === "production";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  PORT: z.coerce.number().default(3333),

  JWT_SECRET: isProduction
    ? z.string().min(16)
    : z.string().min(16).default("controle-epis-jwt-secret-dev"),

  JWT_EXPIRES_IN: z.string().default("8h"),

  ADMIN_DEFAULT_EMAIL: z.string().email().default("admin@controle-epis.local"),
  ADMIN_DEFAULT_PASSWORD: z.string().min(6).default("admin123"),
  ADMIN_DEFAULT_NAME: z.string().min(2).default("Administrador"),

  TYPEORM_SYNCHRONIZE: z.coerce.boolean().default(!isProduction),

  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().default(5432),

  DB_USER: isProduction
    ? z.string()
    : z.string().default("postgres"),

  DB_PASSWORD: isProduction
    ? z.string()
    : z.string().default("postgres"),

  DB_NAME: z.string().default("controle_epis"),
});

export const env = envSchema.parse(process.env);