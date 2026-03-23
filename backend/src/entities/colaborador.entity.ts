import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { EntregaEntity } from "./entrega.entity";

@Entity({ name: "colaboradores" })
export class ColaboradorEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 120 })
  nome!: string;

  @Column({ type: "varchar", length: 50, unique: true })
  matricula!: string;

  @Column({ type: "varchar", length: 80 })
  setor!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @OneToMany(() => EntregaEntity, (entrega) => entrega.colaborador)
  entregas!: EntregaEntity[];
}
