import { Net_Persona } from 'src/modules/afiliado/entities/Net_Persona';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany } from 'typeorm';

@Entity()
export class Net_TipoIdentificacion {
    @PrimaryGeneratedColumn('uuid')
    id_identificacion: string;

    @Column('varchar', { length: 40, nullable: true })
    tipo_identificacion: string;

    @OneToMany(() => Net_Persona, afiliado => afiliado.tipoIdentificacion)
    afiliado: Net_Persona[];

}