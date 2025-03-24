import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Net_Persona_Colegios } from "./net_persona_colegios.entity";

@Entity({ name: "NET_COLEGIOS_MAGISTERIALES" })
export class Net_Colegios_Magisteriales {
    @PrimaryGeneratedColumn({ name: "ID_COLEGIO", type: "int", primaryKeyConstraintName: 'PK_ID_COLEGIO_MAG' })
    id_colegio: number;

    @Column({ name: "DESCRIPCION", type: "varchar", length: 80 })
    descripcion: string;
    
    @Column({ name: "ABREVIATURA", type: "varchar", length: 50, nullable: true })
    abreviatura: string;

    @OneToMany(() => Net_Persona_Colegios, colegiosPersona => colegiosPersona.colegio)
    personas: Net_Persona_Colegios[];
}