import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Deduccion } from "./deduccion.entity";

@Entity()
export class TipoDeduccion {
    
    @PrimaryGeneratedColumn('uuid')
    id_tipo_deduccion: string;

    @Column('varchar2', { length: 100, nullable: false })
    nombre_tipo_deduccion: string;

    @OneToMany(() => Deduccion, deduccion => deduccion.tipoDeduccion)
    deduccion : Deduccion[];
}