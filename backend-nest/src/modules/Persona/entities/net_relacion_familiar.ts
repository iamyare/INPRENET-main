import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Net_Persona } from "./Net_Persona.entity";

@Entity({ name: 'NET_RELACION_FAMILIAR' })
export class NET_RELACION_FAMILIAR  {

    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_RELACION' })
    id: number;

    @ManyToOne(() => Net_Persona, persona => persona.RELACIONES)
    @JoinColumn({ name: 'ID_PERSONA' })
    persona: Net_Persona;

    @ManyToOne(() => Net_Persona)
    @JoinColumn({ name: 'ID_FAMILIAR' })
    familiar: Net_Persona;

    @Column('varchar2', { length: 100, name: 'parentesco' })
    parentesco: string;
}
