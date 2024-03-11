import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Net_Rol } from "./net_rol.entity";
import { Net_Empleado } from "src/modules/Empresarial/empresas/entities/net_empleado.entity";

@Entity()
export class Net_Usuario {
    @PrimaryGeneratedColumn('uuid')
    ID_USUARIO: string;

    @Column('varchar2', {length: 200, nullable: true })
    @Index("UQ_correo_netUsu", {unique:true})
    CORREO: string;

    @Column('varchar2', { length: 200, nullable: true })
    CONTRASENIA: string;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    FECHA_CREACION: Date;

    @Column('date', { nullable: true })
    FECHA_VERIFICACION: Date;

    @Column('varchar2', { length: 50, nullable: true })
    FECHA_MODIFICACION: string;

    @Column('varchar2', { length: 50, default: 'INACTIVO' })
    ESTADO: string;

    @Column('varchar2', { length: 100, nullable: true })
    PREGUNTA_DE_USUARIO_1: string;

    @Column('varchar2', { length: 100, nullable: true })
    RESPUESTA_DE_USUARIO_1: string;

    @Column('varchar2', { length: 100, nullable: true })
    PREGUNTA_DE_USUARIO_2: string;

    @Column('varchar2', { length: 100, nullable: true })
    RESPUESTA_DE_USUARIO_2: string;

    @Column('varchar2', { length: 100, nullable: true })
    PREGUNTA_DE_USUARIO_3: string;

    @Column('varchar2', { length: 100, nullable: true })
    RESPUESTA_DE_USUARIO_3: string;

    @ManyToOne(() => Net_Rol, rol => rol.usuarios, { cascade: true })
    @JoinColumn({ name: 'ID_ROL' })
    rol: Net_Rol;

    @OneToOne(() => Net_Empleado, empleado => empleado.usuario)
    empleado: Net_Empleado;
}
