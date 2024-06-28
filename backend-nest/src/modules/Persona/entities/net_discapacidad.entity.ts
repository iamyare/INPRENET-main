import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { Net_Persona } from "./net_Persona.entity";

@Entity({
    name: 'NET_DISCAPACIDAD',
})
export class Net_Discapacidad {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_DISCAPACIDAD', primaryKeyConstraintName: 'PK_ID_DISCAPACIDAD' })
    id_discapacidad: number;

    @Column('varchar2', { length: 100, nullable: false, name: 'TIPO_DISCAPACIDAD' })
    tipo_discapacidad: string;

    @Column('varchar2', { length: 500, nullable: true, name: 'DESCRIPCION' })
    descripcion: string;

    @ManyToMany(() => Net_Persona, persona => persona.discapacidades)
    @JoinTable({
        name: 'NET_PERSONA_DISCAPACIDAD',
        joinColumn: {
            name: 'ID_DISCAPACIDAD',
            referencedColumnName: 'id_discapacidad',
            foreignKeyConstraintName: 'FK_ID_DISCAPACIDAD_PERSONA_DISCAPACIDAD'
        },
        inverseJoinColumn: {
            name: 'ID_PERSONA',
            referencedColumnName: 'id_persona',
            foreignKeyConstraintName: 'FK_ID_PERSONA_PERSONA_DISCAPACIDAD'
        }
    })
    personas: Net_Persona[];
}
