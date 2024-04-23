import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Net_Colegios_Magisteriales } from "./net_colegios_magisteriales.entity";
import { Net_Persona } from "src/modules/Persona/entities/Net_Persona.entity";

@Entity("NET_PERSONA_COLEGIOS")
export class Net_Persona_Colegios {
    @PrimaryGeneratedColumn()
    id: number; // Un identificador único para cada fila si es necesario

    @Column()
    idPersona: number;

    @Column()
    idColegio: number;

    @ManyToOne(() => Net_Persona, persona => persona.colegiosMagisteriales)
    @JoinColumn({ name: "ID_PERSONA", referencedColumnName: "id_persona", foreignKeyConstraintName: "FK_NET_PERSONA_COLEGIOS_PERSONA" })
    persona: Net_Persona;

    @ManyToOne(() => Net_Colegios_Magisteriales, colegio => colegio.personas)
    @JoinColumn({ name: "ID_COLEGIO", referencedColumnName: "idColegio", foreignKeyConstraintName: "FK_NET_PERSONA_COLEGIOS_COLEGIO" })
    colegio: Net_Colegios_Magisteriales;
}
