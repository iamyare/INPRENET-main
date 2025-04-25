import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

// Enum para los estados de la sesión para mayor claridad y consistencia
export enum SessionStatus {
  ACTIVE = 'ACTIVA',
  CLOSED = 'CERRADA',
  REVOKED = 'REVOCADA', // Podrías necesitar otros estados como 'EXPIRADA'
  USED = 'USADO', // Para refresh tokens
}

@Entity('NET_SESSION') // Asegúrate que coincida exactamente con el nombre de tu tabla en Oracle
export class NetSession {
  @PrimaryGeneratedColumn({ name: 'ID_SESSION' }) // Mapea al nombre de columna en Oracle
  idSession: number;

  @Index() // Indexar el token puede mejorar el rendimiento de búsqueda
  @Column({ type: 'varchar2', length: 500, name: 'TOKEN', nullable: true }) // Access Token
  token: string | null;

  @Index() // Indexar también el refresh token
  @Column({ type: 'varchar2', length: 500, name: 'REFRESH_TOKEN' })
  refreshToken: string;

  @Column({ type: 'number', name: 'ID_USUARIO_EMPRESA' }) // Foreign key al usuario
  idUsuarioEmpresa: number;

  @Column({ type: 'varchar2', length: 500, name: 'USER_AGENT', nullable: true })
  userAgent: string | null;

  @Column({ type: 'varchar2', length: 50, name: 'IP_ADDRESS', nullable: true })
  ipAddress: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'FECHA_CREACION' })
  fechaCreacion: Date;

  @Column({ type: 'timestamp', name: 'FECHA_EXPIRACION' }) // Expiración del Refresh Token
  fechaExpiracion: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'ULTIMA_ACTIVIDAD' }) // Se actualiza con la validación del Access Token
  ultimaActividad: Date;

  @Column({
    type: 'varchar2',
    length: 20,
    name: 'ESTADO',
    default: SessionStatus.ACTIVE, // Estado por defecto al crear
  })
  estado: string; // Usa el enum SessionStatus para asignar valores
}
