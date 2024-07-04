import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Net_Colegios_Magisteriales } from "./net_colegios_magisteriales.entity";
import { net_persona } from "src/modules/Persona/entities/net_persona.entity";

@Entity("NET_PERSONA_COLEGIOS_MAGISTERIALES")
export class Net_Persona_Colegios {
    @PrimaryGeneratedColumn({ name: "ID_PER_COLE_MAG", primaryKeyConstraintName: 'PK_ID_PER_COL_MAG_NET_COL_M' })
    id: number;

    @ManyToOne(() => net_persona, persona => persona.colegiosMagisteriales)
    @JoinColumn({ name: "ID_PERSONA", referencedColumnName: "id_persona", foreignKeyConstraintName: "FK_NET_PERSONA_COLEGIOS_PERSONA" })
    persona: net_persona;

    @ManyToOne(() => Net_Colegios_Magisteriales, colegio => colegio.personas)
    @JoinColumn({ name: "ID_COLEGIO", referencedColumnName: "idColegio", foreignKeyConstraintName: "FK_NET_PERSONA_COLEGIOS_COLEGIO" })
    colegio: Net_Colegios_Magisteriales;
}
