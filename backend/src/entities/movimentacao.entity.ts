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
import { UserEntity } from "./user.entity";

@Entity({ name: "movimentacoes" })
export class MovimentacaoEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "tipo", type: "varchar", length: 20 })
  tipo!: "entrega" | "entrada_saldo";

  @Column({ name: "colaborador_id", type: "int", nullable: true })
  colaboradorId!: number | null;

  @Column({ name: "usuario_id", type: "int" })
  usuarioId!: number;

  @Column({ name: "data_movimentacao", type: "timestamp" })
  dataMovimentacao!: string;

  @Column({ type: "text", nullable: true })
  observacao!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(() => ColaboradorEntity, { onDelete: "RESTRICT", nullable: true })
  @JoinColumn({ name: "colaborador_id" })
  colaborador!: ColaboradorEntity | null;

  @ManyToOne(() => UserEntity, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "usuario_id" })
  usuario!: UserEntity;
}
