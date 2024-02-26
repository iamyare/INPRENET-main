import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, AfterInsert, getRepository, AfterLoad, Unique, OneToMany } from 'typeorm';
import { Net_Deduccion } from "../../deduccion/entities/net_deduccion.entity";
import { Institucion } from "src/modules/Empresarial/institucion/entities/institucion.entity";
import { Net_Afiliado } from 'src/modules/afiliado/entities/net_afiliado';
import { Net_Planilla } from '../../planilla/entities/net_planilla.entity';
import { IsEnum } from 'class-validator';

@Entity()
export class DetalleDeduccion {
    
    @PrimaryGeneratedColumn('uuid')
    id_ded_deduccion: string;
    
    @ManyToOne(() => Net_Deduccion, deduccion => deduccion.detalleDeduccion, { cascade: true})
    @JoinColumn({ name: 'id_deduccion' })
    deduccion: Net_Deduccion;

    @ManyToOne(() => Net_Afiliado, afiliado => afiliado.detalleDeduccion, { cascade: true})
    @JoinColumn({ name: 'id_afiliado' })
    afiliado: Net_Afiliado;
    
    @ManyToOne(() => Institucion, institucion => institucion.detalleDeduccion, { cascade: true})
    @JoinColumn({ name: 'id_institucion' })
    institucion: Institucion; // Correcto

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    monto_total: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    monto_aplicado: number; 

    @Column('varchar2', { length: 20, nullable: true, default: 'NO COBRADA' })
    @IsEnum({ values: ['COBRADA', 'NO COBRADA', 'INCONSISTENCIA'] })
    estado_aplicacion: string;
    

    @Column('number', {nullable: true})
    anio: number;

    @Column('number', {nullable: true})
    mes: number;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    fecha_aplicado: Date;

    @ManyToOne(() => Net_Planilla, planilla => planilla.detalleDeduccion, { cascade: true })
    @JoinColumn({ name: 'id_planilla' })
    planilla: Net_Planilla;
}