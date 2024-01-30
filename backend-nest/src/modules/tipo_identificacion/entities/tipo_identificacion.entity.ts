import { DatosIdentificacion } from 'src/afiliado/entities/datos_identificacion';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany } from 'typeorm';

@Entity()
export class TipoIdentificacion {
    @PrimaryGeneratedColumn('uuid')
    id_identificacion: string;

    @Column('varchar', { length: 40, nullable: true })
    tipo_identificacion: string;

    @OneToMany(() => DatosIdentificacion, datosIdentificacion => datosIdentificacion.tipoIdentificacion)
    datosIdentificacion: DatosIdentificacion[];

}