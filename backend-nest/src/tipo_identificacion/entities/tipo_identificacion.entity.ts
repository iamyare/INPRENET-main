import { Afiliado } from 'src/afiliado/entities/afiliado.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany } from 'typeorm';

@Entity()
export class TipoIdentificacion {
    @PrimaryGeneratedColumn('uuid')
    id_identificacion: string;

    @Column('varchar', { length: 40, nullable: true })
    tipo_identificacion: string;

    @OneToMany(() => Afiliado, afiliado => afiliado.tipoIdentificacion)
    afiliados: Afiliado[];

}