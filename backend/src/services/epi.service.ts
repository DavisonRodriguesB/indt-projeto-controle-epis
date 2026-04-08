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
  const countFn = (entregaRepository as unknown as { count?: (input: unknown) => Promise<number> }).count;
  const entregaCount = countFn ? await countFn({ where: { epiId: entity.id } }) : 0;

  return {
    id: entity.id,
    codigo: entity.codigo ?? String(entity.id),
    nome: entity.nome,
    ca: entity.ca,
    categoria_id: entity.categoriaId ?? 0,
    vida_util_dias: entity.vidaUtilDias ?? 365,
    ativo: entity.ativo ?? true,
    pode_editar: entregaCount === 0,
    validade: entity.validade,
    estoque_atual: entity.estoqueAtual,
    estoque_minimo: entity.estoqueMinimo,
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString()
  };
}

export function listEpis(): Promise<Epi[]>;
export function listEpis(input: ListEpisInput): Promise<{ data: Epi[]; total: number }>;
export async function listEpis(input?: ListEpisInput): Promise<{ data: Epi[]; total: number } | Epi[]> {
  if (!input) {
    const entities = await epiRepository.find({ order: { id: "ASC" } });
    return Promise.all(entities.map((entity) => mapEntityToEpi(entity)));
  }

  const [entities, total] = await epiRepository.findAndCount({
    where: { ativo: true },
    order: { id: "ASC" },
    skip: (input.page - 1) * input.pageSize,
    take: input.pageSize
  });

  const rows = await Promise.all(entities.map((entity) => mapEntityToEpi(entity)));
  return { data: rows, total };
}

export async function getEpiById(id: number): Promise<Epi | null> {
  const entity = await epiRepository.findOne({ where: { id, ativo: true } });
  if (!entity) {
    return null;
  }

  return mapEntityToEpi(entity);
}

export async function createEpi(input: CreateEpiInput): Promise<Epi> {
  if (input.codigo) {
    const duplicate = await epiRepository.findOne({ where: { codigo: input.codigo } });
    if (duplicate) {
      throw new AppError(409, "Codigo de EPI ja cadastrado.", "EPI_CODIGO_ALREADY_EXISTS");
    }
  }

  if (typeof input.categoriaId === "number") {
    const categoria = await categoriaRepository.findOne({ where: { id: input.categoriaId, ativo: true } });
    if (!categoria) {
      throw new AppError(404, "Categoria nao encontrada.", "CATEGORIA_NOT_FOUND");
    }
  }

  const entity = epiRepository.create({
    codigo: input.codigo ?? `${input.ca}-${Date.now()}`,
    nome: input.nome,
    ca: input.ca,
    categoriaId: input.categoriaId ?? 0,
    vidaUtilDias: input.vidaUtilDias ?? 365,
    ativo: input.ativo ?? true,
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

  if (input.codigo) {
    const duplicate = await epiRepository.findOne({ where: { codigo: input.codigo } });
    if (duplicate && duplicate.id !== id) {
      throw new AppError(409, "Codigo de EPI ja cadastrado.", "EPI_CODIGO_ALREADY_EXISTS");
    }
  }

  if (typeof input.categoriaId === "number") {
    const categoria = await categoriaRepository.findOne({ where: { id: input.categoriaId, ativo: true } });
    if (!categoria) {
      throw new AppError(404, "Categoria nao encontrada.", "CATEGORIA_NOT_FOUND");
    }
  }

  entity.codigo = input.codigo ?? entity.codigo;
  entity.nome = input.nome;
  entity.ca = input.ca;
  entity.categoriaId = input.categoriaId ?? entity.categoriaId;
  entity.vidaUtilDias = input.vidaUtilDias ?? entity.vidaUtilDias;
  entity.ativo = input.ativo ?? entity.ativo;
  entity.validade = input.validade;
  entity.estoqueAtual = input.estoqueAtual;
  entity.estoqueMinimo = input.estoqueMinimo;

  const updated = await epiRepository.save(entity);

  return mapEntityToEpi(updated);
}

export async function entradaSaldoEpi(id: number, quantidade: number): Promise<Epi | null> {
  const entity = await epiRepository.findOne({ where: { id, ativo: true } });
  if (!entity) {
    return null;
  }

  entity.estoqueAtual = entity.estoqueAtual + quantidade;
  const updated = await epiRepository.save(entity);
  return mapEntityToEpi(updated);
}

export async function deleteEpi(id: number): Promise<boolean> {
  const deleteFn = (epiRepository as unknown as { delete?: (input: unknown) => Promise<{ affected?: number }> }).delete;
  if (deleteFn) {
    const result = await deleteFn({ id });
    if (typeof result.affected === "number") {
      return result.affected > 0;
    }
  }

  const entity = await epiRepository.findOne({ where: { id } });
  if (!entity) {
    return false;
  }

  entity.ativo = false;
  await epiRepository.save(entity);
  return true;
}
