import { AppDataSource } from "../database/data-source";
import { CargoEntity } from "../entities/cargo.entity";
import { CategoriaEntity } from "../entities/categoria.entity";
import { SetorEntity } from "../entities/setor.entity";
import { AppError } from "../middlewares/error-handler";

type BaseEntityName = "cargos" | "setores" | "categorias";

type ListBaseItemsInput = {
  page: number;
  pageSize: number;
  status?: boolean;
};

type BaseItem = {
  id: number;
  descricao: string;
  ativo: boolean;
};

function getRepository(entity: BaseEntityName) {
  switch (entity) {
    case "cargos":
      return AppDataSource.getRepository(CargoEntity);
    case "setores":
      return AppDataSource.getRepository(SetorEntity);
    case "categorias":
      return AppDataSource.getRepository(CategoriaEntity);
    default:
      throw new AppError(400, "Entidade invalida.", "INVALID_ENTITY");
  }
}

export async function listBaseItems(entity: BaseEntityName): Promise<BaseItem[]> {
  const result = await listBaseItemsPaginated(entity, {
    page: 1,
    pageSize: 100,
    status: true
  });

  return result.data;
}

export async function listBaseItemsPaginated(
  entity: BaseEntityName,
  input: ListBaseItemsInput
): Promise<{ data: BaseItem[]; total: number }> {
  const repository = getRepository(entity);
  const where = typeof input.status === "boolean" ? { ativo: input.status } : {};

  const [rows, total] = await repository.findAndCount({
    where,
    order: { id: "ASC" },
    skip: (input.page - 1) * input.pageSize,
    take: input.pageSize
  });

  return {
    data: rows.map((row) => ({
      id: row.id,
      descricao: row.descricao,
      ativo: row.ativo
    })),
    total
  };
}

export async function createBaseItem(entity: BaseEntityName, descricao: string): Promise<BaseItem> {
  const repository = getRepository(entity);
  const normalized = descricao.trim();

  const existing = await repository.findOne({ where: { descricao: normalized } });
  if (existing) {
    throw new AppError(409, "Descricao ja cadastrada.", "BASE_ITEM_ALREADY_EXISTS");
  }

  const created = repository.create({ descricao: normalized, ativo: true });
  const saved = await repository.save(created);

  return {
    id: saved.id,
    descricao: saved.descricao,
    ativo: saved.ativo
  };
}

export async function updateBaseItem(entity: BaseEntityName, id: number, descricao: string, ativo?: boolean): Promise<BaseItem | null> {
  const repository = getRepository(entity);
  const row = await repository.findOne({ where: { id } });
  if (!row) {
    return null;
  }

  const normalized = descricao.trim();
  const duplicate = await repository.findOne({ where: { descricao: normalized } });
  if (duplicate && duplicate.id !== id) {
    throw new AppError(409, "Descricao ja cadastrada.", "BASE_ITEM_ALREADY_EXISTS");
  }

  row.descricao = normalized;
  if (typeof ativo === "boolean") {
    row.ativo = ativo;
  }

  const saved = await repository.save(row);

  return {
    id: saved.id,
    descricao: saved.descricao,
    ativo: saved.ativo
  };
}
