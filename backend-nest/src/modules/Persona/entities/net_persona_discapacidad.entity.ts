import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { net_persona } from "./net_persona.entity";
import { Net_Discapacidad } from "./net_discapacidad.entity";

@Entity({
    name: 'NET_PERSONA_DISCAPACIDAD',
})
export class Net_Persona_Discapacidad {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_UNICO', primaryKeyConstraintName: 'PK_ID_UNICO' })
    id_unico: number;

    @ManyToOne(() => Net_Discapacidad, discapacidad => discapacidad.personaDiscapacidades)
    @JoinColumn({ name: 'ID_DISCAPACIDAD', referencedColumnName: 'id_discapacidad', foreignKeyConstraintName: 'FK_ID_DISCAPACIDAD_PERSONA_DISCAPACIDAD' })
    discapacidad: Net_Discapacidad;

    @ManyToOne(() => net_persona, persona => persona.personaDiscapacidades)
    @JoinColumn({ name: 'ID_PERSONA', referencedColumnName: 'id_persona', foreignKeyConstraintName: 'FK_ID_PERSONA_PERSONA_DISCAPACIDAD' })
    persona: net_persona;
}
