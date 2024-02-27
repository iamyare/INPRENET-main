/* import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Deduccion } from "./net_deduccion.entity";

@Entity()
export class Net_TipoDeduccion {
    
    @PrimaryGeneratedColumn('uuid')
    id_tipo_deduccion: string;

    @Column('varchar2', { length: 100, nullable: false })
    nombre_tipo_deduccion: string;

    @OneToMany(() => Net_Deduccion, deduccion => deduccion.tipoDeduccion)
    deduccion : Net_Deduccion[];
} */