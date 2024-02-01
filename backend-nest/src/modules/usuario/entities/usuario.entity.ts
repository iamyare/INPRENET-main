import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { Rol } from "./rol.entity";
import { Empleado } from "src/modules/Empresarial/empresas/entities/empleado.entity";
/* import { Afiliado } from "src/afiliado/entities/detalle_afiliado.entity"; */

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn('uuid')
    id_usuario: string;

    @Column('varchar2', { unique:true, length: 200, nullable: true })
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

    @ManyToOne(() => Rol, rol => rol.usuarios, { cascade: true })
    @JoinColumn({ name: 'id_rol' })
    rol: Rol;

    @OneToOne(() => Empleado, empleado => empleado.usuario)
    empleado: Empleado;

    /* @OneToOne(() => Afiliado, afiliado => afiliado.usuario)
    afiliado: Afiliado; */
}
