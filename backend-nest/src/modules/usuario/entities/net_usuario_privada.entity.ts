import { Net_Centro_Trabajo } from "src/modules/Empresarial/centro-trabajo/entities/net_centro-trabajo.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Net_Rol } from "./net_rol.entity";

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
    
    @ManyToOne(() => Net_Rol, rol => rol.usuarios)
    @JoinColumn({ name: 'ID_ROL' })
    rol: Net_Rol;

    @ManyToOne(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.perfAfilCentTrabs, { nullable: true })
    @JoinColumn({ name: 'ID_CENTRO_TRABAJO' }) // Esta relación es opcional y solo se utiliza si un usuario está asociado con un centro de trabajo específico.
    centroTrabajo: Net_Centro_Trabajo | null;
    
}
