import { Net_Afiliado } from 'src/modules/afiliado/entities/net_afiliado';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany } from 'typeorm';

@Entity()
export class Net_TipoIdentificacion {
    @PrimaryGeneratedColumn('uuid')
    id_identificacion: string;

    @Column('varchar', { length: 40, nullable: true })
    tipo_identificacion: string;

    @OneToMany(() => Net_Afiliado, afiliado => afiliado.tipoIdentificacion)
    afiliado: Net_Afiliado[];

}