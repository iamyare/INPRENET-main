import { Pais } from "src/modules/Regional/pais/entities/pais.entity";
import { TipoIdentificacion } from "src/modules/tipo_identificacion/entities/tipo_identificacion.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Afiliado } from "./afiliado.entity";

@Entity()
export class DatosIdentificacion {

    @PrimaryGeneratedColumn('uuid')
    id_datos_identificacion: string;

    @ManyToOne(() => TipoIdentificacion, tipoIdentificacion => tipoIdentificacion.datosIdentificacion, { cascade: true })
    @JoinColumn({ name: 'id_tipo_identificacion' })
    tipoIdentificacion: TipoIdentificacion;

    @ManyToOne(() => Pais, pais => pais.datosIdentificacion, { cascade: true })
    @JoinColumn({ name: 'id_pais' })
    pais: Pais;
    
    @Column('varchar2', { length: 40, nullable: true, unique: true })
    dni: string;
    
    @Column('varchar2', { length: 40, nullable: true })
    primer_nombre: string;

    @Column('varchar2', { length: 40, nullable: true })
    segundo_nombre: string;

    @Column('varchar2', { length: 40, nullable: true })
    tercer_nombre: string;

    @Column('varchar2', { length: 40, nullable: true })
    primer_apellido: string;

    @Column('varchar2', { length: 40, nullable: true })
    segundo_apellido: string;

    @Column('date', { nullable: true })
    fecha_nacimiento: string;

    @Column('varchar2', { length: 200, nullable: true })
    archivo_identificacion: string;

    @OneToMany(() => Afiliado, afiliado => afiliado.datosIdentificacion)
    afiliado: Afiliado[];

}