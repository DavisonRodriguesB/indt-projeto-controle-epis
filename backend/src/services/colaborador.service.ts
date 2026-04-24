import { AppDataSource } from "../database/data-source";
import { ColaboradorEntity } from "../entities/colaborador.entity";
import { AppError } from "../middlewares/error-handler";

const repo = AppDataSource.getRepository(ColaboradorEntity);

function mapEntity(entity: ColaboradorEntity) {
  return {
    id: entity.id,
    nome: entity.nome,
    matricula: entity.matricula,
    cargo_id: entity.cargoId, 
    setor_id: entity.setorId, 
    status: entity.status,
    cargo: entity.cargo ? { descricao: entity.cargo.descricao } : null,
    setor: entity.setor ? { descricao: entity.setor.descricao } : null,
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString()
  };
}

export async function listColaboradores() {
  const entities = await repo.find({
    order: { nome: "ASC" },
    relations: ["cargo", "setor"] 
  });
  return entities.map(mapEntity);
}

export async function getColaboradorById(id: any) {
  const entity = await repo.findOne({ 
    where: { id },
    relations: ["cargo", "setor"]
  });
  return entity ? mapEntity(entity) : null;
}

export async function createColaborador(input: any) {
  const existing = await repo.findOne({ where: { matricula: input.matricula } });
  if (existing) {
    throw new AppError(409, "Matrícula já cadastrada.");
  }

  const entity = repo.create({
    nome: input.nome,
    matricula: input.matricula,
    cargoId: input.cargo_id,
    setorId: input.setor_id, 
    status: true
  });

  const saved = await repo.save(entity);
  return mapEntity(saved);
}

export async function updateColaborador(id: any, input: any) {
  const entity = await repo.findOne({ where: { id } });
  if (!entity) return null;

  if (input.matricula && input.matricula !== entity.matricula) {
    const duplicate = await repo.findOne({ where: { matricula: input.matricula } });
    if (duplicate) throw new AppError(409, "Matrícula já em uso.");
  }

  entity.nome = input.nome ?? entity.nome;
  entity.matricula = input.matricula ?? entity.matricula;
  entity.cargoId = input.cargo_id ?? entity.cargoId;
  entity.setorId = input.setor_id ?? entity.setorId;
  entity.status = input.status ?? entity.status;

  const saved = await repo.save(entity);
  return mapEntity(saved);
}

export async function deleteColaborador(id: any) {
  const entity = await repo.findOne({ where: { id } });
  if (!entity) return false;

  entity.status = false;
  await repo.save(entity);
  return true;
}