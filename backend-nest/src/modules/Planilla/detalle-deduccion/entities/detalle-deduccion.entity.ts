import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, AfterInsert, getRepository, AfterLoad, Unique } from 'typeorm';
import { Deduccion } from "../../deduccion/entities/deduccion.entity";
import { Institucion } from "src/modules/Empresarial/institucion/entities/institucion.entity";
import { Afiliado } from 'src/afiliado/entities/afiliado';

@Entity()
export class DetalleDeduccion {
    
    @PrimaryGeneratedColumn('uuid')
    id_ded_deduccion: string;
    
    @ManyToOne(() => Deduccion, deduccion => deduccion.detalleDeduccion, { cascade: true})
    @JoinColumn({ name: 'id_deduccion' })
    deduccion: Deduccion;

    @ManyToOne(() => Afiliado, afiliado => afiliado.detalleDeduccion, { cascade: true})
    @JoinColumn({ name: 'id_afiliado' })
    afiliado: Afiliado;
    
    @ManyToOne(() => Institucion, institucion => institucion.detalleDeduccion, { cascade: true})
    @JoinColumn({ name: 'id_institucion' })
    institucion: Institucion; // Correcto

    @Column('number', {nullable: true})
    monto_total: number;

    @Column('number', {nullable: true})
    monto_aplicado: number; 

    @Column('varchar2', { length: 20, nullable: true })
    estado_aplicacion: string;

    @Column('number', {nullable: true})
    anio: number;

    @Column('number', {nullable: true})
    mes: number;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    fecha_aplicado: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    fecha_subida: Date;
}