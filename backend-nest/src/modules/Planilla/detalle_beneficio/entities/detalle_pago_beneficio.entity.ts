import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Planilla } from "../../planilla/entities/net_planilla.entity";
import { Net_Detalle_Beneficio_Afiliado } from "./net_detalle_beneficio_afiliado.entity";
export enum EstadoEnum {
    PAGADA = 'PAGADA',
    NO_PAGADA = 'NO PAGADA',
    INCONSISTENCIA = 'INCONSISTENCIA'
}
@Entity()
export class DetallePagoBeneficio {

    @PrimaryGeneratedColumn('uuid')
    ID_BENEFICIO_PLANILLA : string;

    @Column({default:"NO PAGADA", enum: ['NO PAGADA', 'PAGADA']})
    ESTADO: string;

    @Column({nullable:true})
    METODO_PAGO: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    MONTO_PAGAR_POR_PERIODO: number;
    
    @ManyToOne(() => Net_Planilla, planilla => planilla.detallepagobeneficio, { cascade: true })
    @JoinColumn({ name: 'ID_PLANILLA' })
    planilla: Net_Planilla;

    @ManyToOne(() => Net_Detalle_Beneficio_Afiliado, detalleBeneficioAfiliado => detalleBeneficioAfiliado.detalleBeneficio, { cascade: true })
    @JoinColumn({ name: 'ID_BENEFICIO_PLANILLA' })
    detalleBeneficioAfiliado: Net_Detalle_Beneficio_Afiliado;

}