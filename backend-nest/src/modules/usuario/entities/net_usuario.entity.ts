import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Net_Rol } from "./net_rol.entity";
import { Net_Empleado } from "src/modules/Empresarial/empresas/entities/net_empleado.entity";
import { NET_MOVIMIENTO_CUENTA } from "src/modules/transacciones/entities/net_movimiento_cuenta.entity";
@Entity({ name: 'NET_USUARIO' })
export class Net_Usuario {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_USUARIO', primaryKeyConstraintName: 'PK_id_usuario_usuar' })
    id_usuario: number;

    @Column('varchar2', { length: 200, nullable: true, name: 'CORREO' })
    @Index("UQ_correo_netUsu", { unique: true })
    correo: string;

    @Column('varchar2', { length: 200, nullable: true, name: 'CONTRASENA' })
    contrasena: string;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', name: 'FECHA_CREACION' })
    fecha_creacion: Date;

    @Column('date', { nullable: true, name: 'FECHA_VERIFICACION' })
    fecha_verificacion: Date;

    @Column('varchar2', { length: 50, nullable: true, name: 'FECHA_MODIFICACION' })
    fecha_modificacion: string;

    @Column('varchar2', { length: 50, default: 'INACTIVO', name: 'ESTADO' })
    estado: string;

    @Column('varchar2', { length: 100, nullable: true, name: 'PREGUNTA_DE_USUARIO_1' })
    pregunta_de_usuario_1: string;

    @Column('varchar2', { length: 100, nullable: true, name: 'RESPUESTA_DE_USUARIO_1' })
    respuesta_de_usuario_1: string;

    @Column('varchar2', { length: 100, nullable: true, name: 'PREGUNTA_DE_USUARIO_2' })
    pregunta_de_usuario_2: string;

    @Column('varchar2', { length: 100, nullable: true, name: 'RESPUESTA_DE_USUARIO_2' })
    respuesta_de_usuario_2: string;

    @Column('varchar2', { length: 100, nullable: true, name: 'PREGUNTA_DE_USUARIO_3' })
    pregunta_de_usuario_3: string;

    @Column('varchar2', { length: 100, nullable: true, name: 'RESPUESTA_DE_USUARIO_3' })
    respuesta_de_usuario_3: string;

    @ManyToOne(() => Net_Rol, rol => rol.usuarios, { cascade: true })
    @JoinColumn({ name: 'ID_ROL' })
    rol: Net_Rol;

    @OneToOne(() => Net_Empleado, empleado => empleado.usuario)
    empleado: Net_Empleado;
}
