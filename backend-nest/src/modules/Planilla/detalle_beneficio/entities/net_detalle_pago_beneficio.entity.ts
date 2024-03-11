import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Planilla } from "../../planilla/entities/net_planilla.entity";
import { Net_Detalle_Beneficio_Afiliado } from "./net_detalle_beneficio_afiliado.entity";
export enum EstadoEnum {
    PAGADA = 'PAGADA',
    NO_PAGADA = 'NO PAGADA',
    INCONSISTENCIA = 'INCONSISTENCIA'
}
@Entity()
export class Net_Detalle_Pago_Beneficio {
    @PrimaryGeneratedColumn({ type: 'int' })
    ID_BENEFICIO_PLANILLA : number;

    @Column({default:"NO PAGADA", enum: ['NO PAGADA', 'PAGADA']})
    ESTADO: string;

    @CreateDateColumn()
    FECHA_CARGA: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    MONTO_A_PAGAR: number;
    
    @ManyToOne(() => Net_Planilla, planilla => planilla.detallepagobeneficio, { cascade: true })
    @JoinColumn({ name: 'ID_PLANILLA' })
    planilla: Net_Planilla;

    @ManyToOne(() => Net_Detalle_Beneficio_Afiliado, detalleBeneficioAfiliado => detalleBeneficioAfiliado.detalleBeneficio, { cascade: true })
    @JoinColumn({ name: 'ID_BENEFICIO_PLANILLA' })
    detalleBeneficioAfiliado: string;

}