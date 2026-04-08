import { AppDataSource } from "../database/data-source";
import { ColaboradorEntity } from "../entities/colaborador.entity";
import { EntregaEntity } from "../entities/entrega.entity";
import { EpiEntity } from "../entities/epi.entity";
import { UserEntity } from "../entities/user.entity";
import { AppError } from "../middlewares/error-handler";
import { CreateEntregaInput, EntregaListItem } from "../types/entrega";

export async function createEntrega(input: CreateEntregaInput, usuarioId: number): Promise<void> {
  await AppDataSource.transaction(async (manager) => {
    const colaborador = await manager.findOne(ColaboradorEntity, {
      where: { id: input.colaboradorId }
    });

    if (!colaborador) {
      throw new AppError(404, "Colaborador nao encontrado.", "COLABORADOR_NOT_FOUND");
    }

    const epi = await manager
      .getRepository(EpiEntity)
      .createQueryBuilder("epi")
      .setLock("pessimistic_write")
      .where("epi.id = :id", { id: input.epiId })
      .getOne();

    if (!epi) {
      throw new AppError(404, "EPI nao encontrado.", "EPI_NOT_FOUND");
    }

    if (epi.estoqueAtual < input.quantidade) {
      throw new AppError(400, "Estoque insuficiente para entrega.", "EPI_INSUFFICIENT_STOCK", {
        estoqueAtual: epi.estoqueAtual,
        quantidadeSolicitada: input.quantidade
      });
    }

    const usuario = await manager.findOne(UserEntity, { where: { id: usuarioId } });

    if (!usuario) {
      throw new AppError(401, "Usuario nao autenticado.", "AUTH_REQUIRED");
    }

    const entrega = manager.create(EntregaEntity, {
      colaboradorId: input.colaboradorId,
      epiId: input.epiId,
      usuarioId,
      quantidade: input.quantidade,
      dataEntrega: input.dataEntrega ?? new Date().toISOString().slice(0, 10),
      observacao: input.observacao ?? null
    });

    await manager.save(entrega);

    epi.estoqueAtual = epi.estoqueAtual - input.quantidade;
    await manager.save(epi);
  });
}

export async function listEntregas(): Promise<EntregaListItem[]> {
  const entregas = await AppDataSource.getRepository(EntregaEntity).find({
    relations: {
      colaborador: true,
      epi: true,
      usuario: true
    },
    order: {
      id: "DESC"
    }
  });

  return entregas.map((entrega) => ({
    id: entrega.id,
    quantidade: entrega.quantidade,
    data_entrega: entrega.dataEntrega,
    observacao: entrega.observacao,
    colaborador: {
      id: entrega.colaborador.id,
      nome: entrega.colaborador.nome,
      matricula: entrega.colaborador.matricula,
      setor: (entrega.colaborador as unknown as { setor?: string }).setor ?? "",
      setor_id: entrega.colaborador.setorId
    },
    epi: {
      id: entrega.epi.id,
      nome: entrega.epi.nome,
      ca: entrega.epi.ca
    },
    usuario: {
      id: entrega.usuario.id,
      nome: entrega.usuario.nome,
      email: entrega.usuario.email,
      role: entrega.usuario.role
    }
  }));
}
