import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { EpiEntity } from "./epi.entity";
import { MovimentacaoEntity } from "./movimentacao.entity";

@Entity({ name: "movimentacao_itens" })
export class MovimentacaoItemEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "movimentacao_id", type: "int" })
  movimentacaoId!: number;

  @Column({ name: "epi_id", type: "int" })
  epiId!: number;

  @Column({ type: "int" })
  quantidade!: number;

  @Column({ name: "data_vencimento", type: "date", nullable: true })
  dataVencimento!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(() => MovimentacaoEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "movimentacao_id" })
  movimentacao!: MovimentacaoEntity;

  @ManyToOne(() => EpiEntity, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "epi_id" })
  epi!: EpiEntity;
}
