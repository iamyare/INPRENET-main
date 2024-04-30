import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Net_Colegios_Magisteriales } from "./net_colegios_magisteriales.entity";
import { Net_Persona } from "src/modules/Persona/entities/Net_Persona.entity";

@Entity("NET_PERSONA_COLEGIOS_MAGISTERIALES")
export class Net_Persona_Colegios {
    @PrimaryGeneratedColumn({name: "ID_PER_COLE_MAG"})
    id: number; 

    @ManyToOne(() => Net_Persona, persona => persona.colegiosMagisteriales)
    @JoinColumn({ name: "ID_PERSONA", referencedColumnName: "id_persona", foreignKeyConstraintName: "FK_NET_PERSONA_COLEGIOS_PERSONA" })
    persona: Net_Persona;

    @ManyToOne(() => Net_Colegios_Magisteriales, colegio => colegio.personas)
    @JoinColumn({ name: "ID_COLEGIO", referencedColumnName: "idColegio", foreignKeyConstraintName: "FK_NET_PERSONA_COLEGIOS_COLEGIO" })
    colegio: Net_Colegios_Magisteriales;
}
