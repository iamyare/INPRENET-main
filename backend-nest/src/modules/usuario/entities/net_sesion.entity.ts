import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { NET_USUARIO_PRIVADA } from './net_usuario_privada.entity';
import { Net_Usuario_Empresa } from './net_usuario_empresa.entity';

@Entity({ name: 'NET_SESION' })
export class NET_SESION {
    @PrimaryGeneratedColumn()
    id_sesion: number;

    @ManyToOne(() => NET_USUARIO_PRIVADA, usuarioPrivada => usuarioPrivada.sesiones, { nullable: true })
    @JoinColumn({ name: 'id_usuario_privada' })
    usuarioPrivada: NET_USUARIO_PRIVADA | null;

    @ManyToOne(() => Net_Usuario_Empresa, usuario => usuario.sesiones, { nullable: true })
    @JoinColumn({ name: 'id_usuario' })
    usuario: Net_Usuario_Empresa | null;

    @Column()
    token: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha_creacion: Date;

    @Column({ type: 'timestamp', nullable: true })
    fecha_expiracion: Date;

    @Column({ type: 'varchar', length: 20, default: 'activa' })
    estado: string; 
}