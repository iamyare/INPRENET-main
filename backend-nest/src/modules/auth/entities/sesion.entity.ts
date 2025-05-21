import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Net_Usuario_Empresa } from '../../usuario/entities/net_usuario_empresa.entity';

@Entity('sesiones')
export class Sesion {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  token: string;

  @Column({ type: 'varchar', length: 50 })
  estado: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  fecha_actualizacion: Date;

  @Column({ type: 'int' })
  usuario_id: number;

  @ManyToOne(() => Net_Usuario_Empresa, (usuario) => usuario.id_usuario_empresa)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Net_Usuario_Empresa;
}
