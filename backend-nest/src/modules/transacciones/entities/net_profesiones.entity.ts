import { Net_Persona } from 'src/modules/Persona/entities/Net_Persona.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('NET_PROFESIONES')
export class NET_PROFESIONES {
    @PrimaryGeneratedColumn({ name: 'ID_PROFESION' })
    idProfesion: number;

    @Column({ name: 'DESCRIPCION', length: 50 })
    descripcion: string;

    @OneToMany(() => Net_Persona, persona => persona.profesion)
    personas: Net_Persona[];
}
