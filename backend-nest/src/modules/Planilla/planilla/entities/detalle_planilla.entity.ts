import { Afiliado } from "src/afiliado/entities/afiliado";
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Planilla } from "./planilla.entity";
import { DetalleDeduccion } from "../../detalle-deduccion/entities/detalle-deduccion.entity";
import { BeneficioPlanilla } from "../../beneficio_planilla/entities/beneficio_planilla.entity";

@Entity()
export class DetallePlanilla {

    @PrimaryGeneratedColumn('uuid')
    id_detalle_planilla : string

    @ManyToOne(() => DetalleDeduccion, detalleDeduccion => detalleDeduccion.detallePlanilla, { cascade: true })
    @JoinColumn({ name: 'id_detalle_deduccion' })
    detalleDeduccion: DetalleDeduccion;

    @ManyToOne(() => BeneficioPlanilla, beneficioPlanilla => beneficioPlanilla.detallePlanilla, { cascade: true })
    @JoinColumn({ name: 'id_detalle_beneficio' })
    beneficioPlanilla: BeneficioPlanilla;

    @ManyToOne(() => Planilla, planilla => planilla.detallePlanilla, { cascade: true })
    @JoinColumn({ name: 'id_planilla' })
    planilla: Planilla;
}