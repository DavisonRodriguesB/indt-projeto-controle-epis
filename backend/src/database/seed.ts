import { hash } from "bcryptjs";
import { env } from "../config/env";
import { UserEntity } from "../entities/user.entity";
import { AppDataSource } from "./data-source";

export async function seedAdminUser(): Promise<void> {
  const userRepository = AppDataSource.getRepository(UserEntity);
  const existingAdmin = await userRepository.findOne({ where: { email: env.ADMIN_DEFAULT_EMAIL } });

  if (existingAdmin) {
    return;
  }

  const passwordHash = await hash(env.ADMIN_DEFAULT_PASSWORD, 10);
  const admin = userRepository.create({
    nome: env.ADMIN_DEFAULT_NAME,
    email: env.ADMIN_DEFAULT_EMAIL,
    senhaHash: passwordHash,
    role: "admin"
  });

  await userRepository.save(admin);
}
