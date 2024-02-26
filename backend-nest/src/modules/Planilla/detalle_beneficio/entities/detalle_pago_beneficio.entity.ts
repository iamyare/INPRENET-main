import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
/* import { Beneficio } from "../../beneficio/entities/beneficio.entity";
import { Afiliado } from "src/modules/afiliado/entities/afiliado"; */
import { Net_Planilla } from "../../planilla/entities/net_planilla.entity";
import { DetalleBeneficioAfiliado } from "./detalle_beneficio_afiliado.entity";
export enum EstadoEnum {
    PAGADA = 'PAGADA',
    NO_PAGADA = 'NO PAGADA',
    INCONSISTENCIA = 'INCONSISTENCIA'
}
@Entity()
export class DetallePagoBeneficio {

    @PrimaryGeneratedColumn('uuid')
    id_beneficio_planilla : string;

    @Column({default:"NO PAGADA", enum: ['NO PAGADA', 'PAGADA']})
    estado: string;

    @Column({nullable:true})
    metodo_pago: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    monto_a_pagar: number;
    
    @ManyToOne(() => Net_Planilla, planilla => planilla.detallepagobeneficio, { cascade: true })
    @JoinColumn({ name: 'id_planilla' })
    planilla: Net_Planilla;

    @ManyToOne(() => DetalleBeneficioAfiliado, detalleBeneficioAfiliado => detalleBeneficioAfiliado.detalleBeneficio, { cascade: true })
    @JoinColumn({ name: 'id_beneficio_afiliado' })
    detalleBeneficioAfiliado: DetalleBeneficioAfiliado;

}