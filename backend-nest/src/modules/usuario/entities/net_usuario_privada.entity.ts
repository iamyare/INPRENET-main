import { Net_Centro_Trabajo } from "src/modules/Empresarial/entities/net_centro_trabajo.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'NET_USUARIO_PRIVADA' })
export class NET_USUARIO_PRIVADA {

    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_USUARIO' })
    id_usuario: number;

    @Column('varchar', { length: 100, nullable: false, unique: true, name: 'EMAIL' })
    email: string;

    @Column('varchar', { length: 255, nullable: false, name: 'PASSWORD_HASH' })
    passwordHash: string;

    @Column('varchar', { length: 50, nullable: false, name: 'NOMBRE_USUARIO' })
    nombre_usuario: string;

    @Column('varchar2', { length: 50, default: 'INACTIVO', name: 'ESTADO' })
    estado: string;

    @ManyToOne(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.perfAfilCentTrabs, { nullable: true })
    @JoinColumn({ name: 'ID_CENTRO_TRABAJO' })
    centroTrabajo: Net_Centro_Trabajo | null;
}
