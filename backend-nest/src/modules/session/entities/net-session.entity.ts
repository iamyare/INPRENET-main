import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Net_Usuario_Empresa } from '../../usuario/entities/net_usuario_empresa.entity';

@Entity('NET_SESSION')
export class Net_Session {
  @PrimaryGeneratedColumn({ name: 'ID_SESSION' })
  id_session: number;

  @Column({ name: 'TOKEN', length: 500 })
  token: string;

  @Column({ name: 'REFRESH_TOKEN', length: 500, nullable: true })
  refresh_token: string;

  @Column({ name: 'USER_AGENT', length: 500 })
  user_agent: string;

  @Column({ name: 'IP_ADDRESS', length: 50 })
  ip_address: string;

  @CreateDateColumn({ name: 'FECHA_CREACION' })
  fecha_creacion: Date;

  @Column({ name: 'FECHA_EXPIRACION' })
  fecha_expiracion: Date;

  @Column({ name: 'ULTIMA_ACTIVIDAD', default: () => 'CURRENT_TIMESTAMP' })
  ultima_actividad: Date;

  @Column({ 
    name: 'ESTADO', 
    length: 20,
    default: 'ACTIVA',
    type: 'varchar'
  })
  estado: 'ACTIVA' | 'EXPIRADA' | 'REVOCADA' | 'CERRADA';

  @ManyToOne(() => Net_Usuario_Empresa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ID_USUARIO_EMPRESA' })
  usuario_empresa: Net_Usuario_Empresa;
}