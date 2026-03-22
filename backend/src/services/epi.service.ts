import { AppDataSource } from "../database/data-source";
import { EpiEntity } from "../entities/epi.entity";
import { CreateEpiInput, Epi, UpdateEpiInput } from "../types/epi";

const epiRepository = AppDataSource.getRepository(EpiEntity);

function mapEntityToEpi(entity: EpiEntity): Epi {
  return {
    id: entity.id,
    nome: entity.nome,
    ca: entity.ca,
    validade: entity.validade,
    estoque_atual: entity.estoqueAtual,
    estoque_minimo: entity.estoqueMinimo,
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString()
  };
}

export async function listEpis(): Promise<Epi[]> {
  const entities = await epiRepository.find({ order: { id: "ASC" } });
  return entities.map(mapEntityToEpi);
}

export async function getEpiById(id: number): Promise<Epi | null> {
  const entity = await epiRepository.findOne({ where: { id } });
  if (!entity) {
    return null;
  }

  return mapEntityToEpi(entity);
}

export async function createEpi(input: CreateEpiInput): Promise<Epi> {
  const entity = epiRepository.create({
    nome: input.nome,
    ca: input.ca,
    validade: input.validade,
    estoqueAtual: input.estoqueAtual,
    estoqueMinimo: input.estoqueMinimo
  });

  const saved = await epiRepository.save(entity);
  return mapEntityToEpi(saved);
}

export async function updateEpi(id: number, input: UpdateEpiInput): Promise<Epi | null> {
  const entity = await epiRepository.findOne({ where: { id } });
  if (!entity) {
    return null;
  }

  entity.nome = input.nome;
  entity.ca = input.ca;
  entity.validade = input.validade;
  entity.estoqueAtual = input.estoqueAtual;
  entity.estoqueMinimo = input.estoqueMinimo;

  const updated = await epiRepository.save(entity);

  return mapEntityToEpi(updated);
}

export async function deleteEpi(id: number): Promise<boolean> {
  const result = await epiRepository.delete({ id });
  return (result.affected ?? 0) > 0;
}
