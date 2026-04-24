import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { CategoriaEntity } from "./categoria.entity";
import { EntregaEntity } from "./entrega.entity";

@Entity({ name: "epis" })
export class EpiEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 120 })
  nome!: string;

  @Column({ type: "varchar", length: 50, unique: true })
  codigo!: string;

  @Column({ type: "varchar", length: 30 })
  ca!: string;

  @Column({ name: "categoria_id", type: "int" })
  categoriaId!: number;

  @Column({ name: "vida_util_dias", type: "int", default: 365 })
  vidaUtilDias!: number;

  @Column({ type: "boolean", default: true })
  ativo!: boolean;

  @Column({ type: "date" })
  validade!: string;

  @Column({ name: "estoque_atual", type: "int", default: 0 })
  estoqueAtual!: number;

  @Column({ name: "estoque_minimo", type: "int", default: 0 })
  estoqueMinimo!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @OneToMany(() => EntregaEntity, (entrega) => entrega.epi)
  entregas!: EntregaEntity[];

  @ManyToOne(() => CategoriaEntity, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "categoria_id" })
  categoria?: CategoriaEntity;
}