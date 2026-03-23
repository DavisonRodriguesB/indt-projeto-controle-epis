import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { ColaboradorEntity } from "./colaborador.entity";
import { EpiEntity } from "./epi.entity";
import { UserEntity } from "./user.entity";

@Entity({ name: "entregas" })
export class EntregaEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "colaborador_id", type: "int" })
  colaboradorId!: number;

  @Column({ name: "epi_id", type: "int" })
  epiId!: number;

  @Column({ name: "usuario_id", type: "int" })
  usuarioId!: number;

  @Column({ type: "int" })
  quantidade!: number;

  @Column({ name: "data_entrega", type: "date" })
  dataEntrega!: string;

  @Column({ type: "text", nullable: true })
  observacao!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(() => ColaboradorEntity, (colaborador) => colaborador.entregas, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "colaborador_id" })
  colaborador!: ColaboradorEntity;

  @ManyToOne(() => EpiEntity, (epi) => epi.entregas, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "epi_id" })
  epi!: EpiEntity;

  @ManyToOne(() => UserEntity, (usuario) => usuario.entregas, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "usuario_id" })
  usuario!: UserEntity;
}
