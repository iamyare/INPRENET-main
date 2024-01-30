import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TipoPlanilla } from '../../tipo-planilla/entities/tipo-planilla.entity';
import { Afiliado } from 'src/afiliado/entities/afiliado.entity';

@Entity()
export class Planilla {

    @PrimaryGeneratedColumn('uuid')
    id_planilla : string

    @Column('varchar2', { length: 36, nullable: false })
    codigo_planilla : string;

    @Column('date', { nullable: false })
    fecha_apertura : string;

    @Column('varchar2', { length: 40, nullable: true })
    secuencia : string;

    @Column('varchar2', { length: 20, nullable: true })
    estado : string;

    @ManyToOne(() => TipoPlanilla, tipoPlanilla => tipoPlanilla.planilla)
    @JoinColumn({ name: 'id_tipo_planilla' })
    tipoPlanilla: TipoPlanilla;

    @ManyToOne(() => Afiliado, afiliado => afiliado.planilla)
    @JoinColumn({ name: 'id_afiliado' })
    afiliado: Afiliado;


}
