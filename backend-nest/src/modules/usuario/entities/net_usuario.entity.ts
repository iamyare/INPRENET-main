import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Net_Rol } from "./net_rol.entity";
import { Net_Empleado } from "src/modules/Empresarial/empresas/entities/net_empleado.entity";

@Entity()
export class Net_Usuario {
    @PrimaryGeneratedColumn('uuid')
    id_usuario: string;

    @Column('varchar2', {length: 200, nullable: true })
    @Index("UQ_correo_netUsu", {unique:true})
    correo: string;

    @Column('varchar2', { length: 200, nullable: true })
    contrasena: string;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    fecha_creacion: Date;

    @Column('date', { nullable: true })
    fecha_verificacion: Date;

    @Column('varchar2', { length: 50, nullable: true })
    fecha_modificacion: string;

    @Column('varchar2', { length: 50, default: 'INACTIVO' })
    estado: string;

    @Column('varchar2', { length: 100, nullable: true })
    pregunta_de_usuario_1: string;

    @Column('varchar2', { length: 100, nullable: true })
    respuesta_de_usuario_1: string;

    @Column('varchar2', { length: 100, nullable: true })
    pregunta_de_usuario_2: string;

    @Column('varchar2', { length: 100, nullable: true })
    respuesta_de_usuario_2: string;

    @Column('varchar2', { length: 100, nullable: true })
    pregunta_de_usuario_3: string;

    @Column('varchar2', { length: 100, nullable: true })
    respuesta_de_usuario_3: string;

    @ManyToOne(() => Net_Rol, rol => rol.usuarios, { cascade: true })
    @JoinColumn({ name: 'id_rol' })
    rol: Net_Rol;

    @OneToOne(() => Net_Empleado, empleado => empleado.usuario)
    empleado: Net_Empleado;
}
