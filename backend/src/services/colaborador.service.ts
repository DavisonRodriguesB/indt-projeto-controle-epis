import { AppDataSource } from "../database/data-source";
import { CargoEntity } from "../entities/cargo.entity";
import { ColaboradorEntity } from "../entities/colaborador.entity";
import { SetorEntity } from "../entities/setor.entity";
import { AppError } from "../middlewares/error-handler";
import { Colaborador, CreateColaboradorInput, UpdateColaboradorInput } from "../types/colaborador";

const colaboradorRepository = AppDataSource.getRepository(ColaboradorEntity);
const cargoRepository = AppDataSource.getRepository(CargoEntity);
const setorRepository = AppDataSource.getRepository(SetorEntity);

function mapEntity(entity: ColaboradorEntity): Colaborador {
  const legacySetor = (entity as unknown as { setor?: string }).setor;

  return {
    id: entity.id,
    nome: entity.nome,
    matricula: entity.matricula,
    setor: legacySetor,
    cargo_id: entity.cargoId,
    setor_id: entity.setorId,
    status: entity.status,
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString()
  };
}

export async function listColaboradores(): Promise<Colaborador[]> {
  const entities = await colaboradorRepository.find({ where: { status: true }, order: { id: "ASC" } });
  return entities.map(mapEntity);
}

export async function createColaborador(input: CreateColaboradorInput): Promise<Colaborador> {
  const existing = await colaboradorRepository.findOne({ where: { matricula: input.matricula } });

  if (existing) {
    throw new AppError(409, "Matricula ja cadastrada.", "COLABORADOR_MATRICULA_ALREADY_EXISTS");
  }

  if (typeof input.cargoId === "number" && typeof input.setorId === "number") {
    const cargo = await cargoRepository.findOne({ where: { id: input.cargoId, ativo: true } });
    if (!cargo) {
      throw new AppError(404, "Cargo nao encontrado.", "CARGO_NOT_FOUND");
    }

    const setor = await setorRepository.findOne({ where: { id: input.setorId, ativo: true } });
    if (!setor) {
      throw new AppError(404, "Setor nao encontrado.", "SETOR_NOT_FOUND");
    }
  }

  const entity = colaboradorRepository.create({
    nome: input.nome,
    matricula: input.matricula,
    cargoId: input.cargoId ?? 0,
    setorId: input.setorId ?? 0,
    status: true
  });

  if (input.setor) {
    (entity as unknown as { setor?: string }).setor = input.setor;
  }

  const saved = await colaboradorRepository.save(entity);
  return mapEntity(saved);
}

export async function updateColaborador(id: number, input: UpdateColaboradorInput): Promise<Colaborador | null> {
  const entity = await colaboradorRepository.findOne({ where: { id } });
  if (!entity) {
    return null;
  }

  const duplicate = await colaboradorRepository.findOne({ where: { matricula: input.matricula } });
  if (duplicate && duplicate.id !== id) {
    throw new AppError(409, "Matricula ja cadastrada.", "COLABORADOR_MATRICULA_ALREADY_EXISTS");
  }

  if (typeof input.cargoId === "number" && typeof input.setorId === "number") {
    const cargo = await cargoRepository.findOne({ where: { id: input.cargoId, ativo: true } });
    if (!cargo) {
      throw new AppError(404, "Cargo nao encontrado.", "CARGO_NOT_FOUND");
    }

    const setor = await setorRepository.findOne({ where: { id: input.setorId, ativo: true } });
    if (!setor) {
      throw new AppError(404, "Setor nao encontrado.", "SETOR_NOT_FOUND");
    }
  }

  entity.nome = input.nome;
  entity.matricula = input.matricula;
  entity.cargoId = input.cargoId ?? entity.cargoId;
  entity.setorId = input.setorId ?? entity.setorId;
  entity.status = input.status ?? entity.status;

  const saved = await colaboradorRepository.save(entity);
  return mapEntity(saved);
}

export async function deleteColaborador(id: number): Promise<boolean> {
  const entity = await colaboradorRepository.findOne({ where: { id } });
  if (!entity) {
    return false;
  }

  entity.status = false;
  await colaboradorRepository.save(entity);
  return true;
}
