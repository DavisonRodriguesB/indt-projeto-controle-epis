import { AppDataSource } from "../database/data-source";
import { CategoriaEntity } from "../entities/categoria.entity";
import { EntregaEntity } from "../entities/entrega.entity";
import { EpiEntity } from "../entities/epi.entity";
import { AppError } from "../middlewares/error-handler";
import { CreateEpiInput, Epi, ListEpisInput, UpdateEpiInput } from "../types/epi";

const epiRepository = AppDataSource.getRepository(EpiEntity);
const categoriaRepository = AppDataSource.getRepository(CategoriaEntity);
const entregaRepository = AppDataSource.getRepository(EntregaEntity);

async function mapEntityToEpi(entity: EpiEntity): Promise<Epi> {
  let entregaCount = 0;
  try {
    entregaCount = await entregaRepository.count({ where: { epiId: entity.id } });
  } catch {
    entregaCount = 0;
  }

  const categoriaInfo = entity.categoria 
    ? ((entity.categoria as any).nome || (entity.categoria as any).descricao) 
    : "Sem Categoria";

  return {
    id: entity.id,
    codigo: entity.codigo ?? String(entity.id),
    nome: entity.nome,
    ca: entity.ca,
    categoria: categoriaInfo,
    categoria_id: entity.categoriaId ?? 0,
    vida_util_dias: entity.vidaUtilDias ?? 365,
    ativo: entity.ativo ?? true,
    pode_editar: entregaCount === 0,
    validade: entity.validade,
    estoque_atual: entity.estoqueAtual,
    estoque_minimo: entity.estoqueMinimo,
    created_at: entity.createdAt ? entity.createdAt.toISOString() : new Date().toISOString(),
    updated_at: entity.updatedAt ? entity.updatedAt.toISOString() : new Date().toISOString()
  };
}

export function listEpis(): Promise<Epi[]>;
export function listEpis(input: ListEpisInput): Promise<{ data: Epi[]; total: number }>;
export async function listEpis(input?: ListEpisInput): Promise<{ data: Epi[]; total: number } | Epi[]> {
  const options = {
    relations: ["categoria"],
    order: { id: "ASC" as const }
  };

  if (!input) {
    const entities = await epiRepository.find(options);
    return Promise.all(entities.map(mapEntityToEpi));
  }

  const [entities, total] = await epiRepository.findAndCount({
    ...options,
    skip: (input.page - 1) * input.pageSize,
    take: input.pageSize
  });

  const rows = await Promise.all(entities.map(mapEntityToEpi));
  return { data: rows, total };
}

export async function getEpiById(id: number): Promise<Epi | null> {
  const entity = await epiRepository.findOne({ 
    where: { id },
    relations: ["categoria"] 
  });
  return entity ? mapEntityToEpi(entity) : null;
}

export async function createEpi(input: CreateEpiInput): Promise<Epi> {
  const entity = epiRepository.create({
    ...input,
    codigo: input.codigo ?? `${input.ca}-${Date.now()}`,
    categoriaId: input.categoriaId ?? 0
  });

  const saved = await epiRepository.save(entity);
  const reloaded = await epiRepository.findOne({ 
    where: { id: saved.id }, 
    relations: ["categoria"] 
  });
  
  if (!reloaded) throw new AppError(500, "Erro ao recarregar EPI.");
  return mapEntityToEpi(reloaded);
}

export async function updateEpi(id: number, input: UpdateEpiInput): Promise<Epi | null> {
  const entity = await epiRepository.findOne({ where: { id } });
  if (!entity) return null;

  Object.assign(entity, input);
  const updated = await epiRepository.save(entity);
  
  const reloaded = await epiRepository.findOne({ 
    where: { id: updated.id }, 
    relations: ["categoria"] 
  });
  return reloaded ? mapEntityToEpi(reloaded) : null;
}

export async function entradaSaldoEpi(id: number, quantidade: number): Promise<Epi | null> {
  const entity = await epiRepository.findOne({ where: { id, ativo: true } });
  if (!entity) return null;

  entity.estoqueAtual += quantidade;
  const updated = await epiRepository.save(entity);
  
  const reloaded = await epiRepository.findOne({ 
    where: { id: updated.id }, 
    relations: ["categoria"] 
  });
  return reloaded ? mapEntityToEpi(reloaded) : null;
}

export async function deleteEpi(id: number): Promise<boolean> {
  const entity = await epiRepository.findOne({ where: { id } });
  if (!entity) return false;
  entity.ativo = false;
  await epiRepository.save(entity);
  return true;
}