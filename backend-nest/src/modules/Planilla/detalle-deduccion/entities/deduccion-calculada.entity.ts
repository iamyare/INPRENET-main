/* import { Afiliado } from 'src/afiliado/entities/afiliado.entity';
import { Institucion } from 'src/modules/Empresarial/institucion/entities/institucion.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, Column } from 'typeorm';

@Entity()
export class DeduccionCalculada{

    @PrimaryGeneratedColumn('uuid')
    id_deduccion_calculada : string;

    @ManyToOne(() => Afiliado, afiliado => afiliado.deduccionCalculada, { cascade: true })
    @JoinColumn({ name: 'id_afiliado' })
    afiliado: Afiliado;

    @ManyToOne(() => Institucion, institucion => institucion.deduccionCalculada, { cascade: true })
    @JoinColumn({ name: 'id_institucion'})
    institucion: Institucion;

    @Column('number', {nullable: true })
    deduccion : number;

    @Column('number', {nullable: true })
    monto_aplicado: number;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    fecha_aplicado: Date;

} */