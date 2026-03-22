import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { EntregaEntity } from "./entrega.entity";

@Entity({ name: "epis" })
export class EpiEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 120 })
  nome!: string;

  @Column({ type: "varchar", length: 30 })
  ca!: string;

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
}
