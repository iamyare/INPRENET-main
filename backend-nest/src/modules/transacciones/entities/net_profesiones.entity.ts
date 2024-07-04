import { net_persona } from 'src/modules/Persona/entities/net_persona.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('NET_PROFESIONES')
export class NET_PROFESIONES {
    @PrimaryGeneratedColumn({ name: 'ID_PROFESION', primaryKeyConstraintName: 'PK_ID_PROFESION_NET_PROF' })
    idProfesion: number;

    @Column({ name: 'DESCRIPCION', length: 50 })
    descripcion: string;

    @OneToMany(() => net_persona, persona => persona.profesion)
    personas: net_persona[];
}
