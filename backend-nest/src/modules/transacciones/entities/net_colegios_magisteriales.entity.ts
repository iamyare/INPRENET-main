import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Net_Persona_Colegios } from "./net_persona_colegios.entity";

@Entity({ name: "NET_COLEGIOS_MAGISTERIALES" })
export class Net_Colegios_Magisteriales {
    @PrimaryGeneratedColumn({ name: "ID_COLEGIO", type: "int", primaryKeyConstraintName: 'PK_ID_COLEGIO_MAG' })
    idColegio: number;

    @Column({ name: "DESCRIPCION", type: "varchar", length: 50 })
    descripcion: string;

    @OneToMany(() => Net_Persona_Colegios, colegiosPersona => colegiosPersona.colegio)
    personas: Net_Persona_Colegios[];
}