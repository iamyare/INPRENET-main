import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Beneficio } from "../../beneficio/entities/beneficio.entity";
import { Afiliado } from "src/modules/afiliado/entities/afiliado";
import { Planilla } from "../../planilla/entities/planilla.entity";
import { DetalleBeneficioAfiliado } from "./detalle_beneficio_afiliado.entity";
export enum EstadoEnum {
    PAGADA = 'PAGADA',
    NO_PAGADA = 'NO PAGADA',
    INCONSISTENCIA = 'INCONSISTENCIA'
}
@Entity()
export class DetalleBeneficio {

    @PrimaryGeneratedColumn('uuid')
    id_beneficio_planilla : string;

    @Column({default:"NO PAGADA", enum: ['NO PAGADA', 'PAGADA']})
    estado: string;

    @Column({nullable:true})
    metodo_pago: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    monto_por_periodo: number;
    
    @Column({nullable:true, default: 0 })
    num_rentas_aplicadas: number;

    @ManyToOne(() => Planilla, planilla => planilla.detallebeneficio, { cascade: true })
    @JoinColumn({ name: 'id_planilla' })
    planilla: Planilla;

    @ManyToOne(() => DetalleBeneficioAfiliado, detalleBeneficioAfiliado => detalleBeneficioAfiliado.detalleBeneficio, { cascade: true })
    @JoinColumn({ name: 'id_beneficio_afiliado' })
    detalleBeneficioAfiliado: DetalleBeneficioAfiliado;

}