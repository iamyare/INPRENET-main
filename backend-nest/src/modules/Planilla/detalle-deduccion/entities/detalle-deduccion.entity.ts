import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, AfterInsert, getRepository, AfterLoad, Unique, OneToMany } from 'typeorm';
import { Net_Persona } from 'src/modules/afiliado/entities/Net_Persona';
import { Net_Planilla } from '../../planilla/entities/net_planilla.entity';
import { IsEnum } from 'class-validator';
import { Net_Deduccion_Terceros } from '../../deduccion/entities/net_deduccion-terceros.entity';

@Entity()
export class Net_Detalle_Deduccion {    
    @PrimaryGeneratedColumn('uuid')
    ID_DED_DEDUCCION: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    MONTO_TOTAL: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    MONTO_APLICADO: number; 

    @Column('varchar2', { length: 20, nullable: true, default: 'NO COBRADA' })
    @IsEnum({ values: ['COBRADA', 'NO COBRADA', 'INCONSISTENCIA'] })
    ESTADO_APLICACION: string;
    
    @Column('number', {nullable: true})
    ANIO: number;

    @Column('number', {nullable: true})
    MES: number;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    FECHA_APLICACO: Date;

    @ManyToOne(() => Net_Persona, afiliado => afiliado.detalleDeduccion, { cascade: true})
    @JoinColumn({ name: 'ID_AFILIADO' })
    afiliado: Net_Persona;

    @ManyToOne(() => Net_Planilla, planilla => planilla.detalleDeduccion, { cascade: true })
    @JoinColumn({ name: 'ID_PLANILLA' })
    planilla: Net_Planilla;

    @ManyToOne(() => Net_Deduccion_Terceros, deduccion => deduccion.detalleDeduccion, { cascade: true})
    @JoinColumn({ name: 'ID_DEDUCCION_TERC' })
    deduccion: Net_Deduccion_Terceros;

}