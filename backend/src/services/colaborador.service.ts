import { AppDataSource } from "../database/data-source";
import { ColaboradorEntity } from "../entities/colaborador.entity";
import { AppError } from "../middlewares/error-handler";
import { Colaborador, CreateColaboradorInput } from "../types/colaborador";

const colaboradorRepository = AppDataSource.getRepository(ColaboradorEntity);

function mapEntity(entity: ColaboradorEntity): Colaborador {
  return {
    id: entity.id,
    nome: entity.nome,
    matricula: entity.matricula,
    setor: entity.setor,
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString()
  };
}

export async function listColaboradores(): Promise<Colaborador[]> {
  const entities = await colaboradorRepository.find({ order: { id: "ASC" } });
  return entities.map(mapEntity);
}

export async function createColaborador(input: CreateColaboradorInput): Promise<Colaborador> {
  const existing = await colaboradorRepository.findOne({ where: { matricula: input.matricula } });

  if (existing) {
    throw new AppError(409, "Matricula ja cadastrada.", "COLABORADOR_MATRICULA_ALREADY_EXISTS");
  }

  const entity = colaboradorRepository.create({
    nome: input.nome,
    matricula: input.matricula,
    setor: input.setor
  });

  const saved = await colaboradorRepository.save(entity);
  return mapEntity(saved);
}
