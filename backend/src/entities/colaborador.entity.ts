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
import { CargoEntity } from "./cargo.entity";
import { EntregaEntity } from "./entrega.entity";
import { SetorEntity } from "./setor.entity";

@Entity({ name: "colaboradores" })
export class ColaboradorEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 120 })
  nome!: string;

  @Column({ type: "varchar", length: 50, unique: true })
  matricula!: string;

  @Column({ name: "cargo_id", type: "int" })
  cargoId!: number;

  @Column({ name: "setor_id", type: "int" })
  setorId!: number;

  @Column({ type: "boolean", default: true })
  status!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @OneToMany(() => EntregaEntity, (entrega) => entrega.colaborador)
  entregas!: EntregaEntity[];

  @ManyToOne(() => CargoEntity, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "cargo_id" })
  cargo!: CargoEntity;

  @ManyToOne(() => SetorEntity, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "setor_id" })
  setor!: SetorEntity;
}
