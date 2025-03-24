import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Persona_Discapacidad } from "./net_persona_discapacidad.entity";

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

    @OneToMany(() => Net_Persona_Discapacidad, personaDiscapacidad => personaDiscapacidad.discapacidad)
    personaDiscapacidades: Net_Persona_Discapacidad[];
}