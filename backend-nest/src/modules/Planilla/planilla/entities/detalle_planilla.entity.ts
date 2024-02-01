import { Afiliado } from "src/afiliado/entities/afiliado";
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Planilla } from "./planilla.entity";

@Entity()
export class DetallePlanilla {

    @PrimaryGeneratedColumn('uuid')
    id_detalle_planilla : string

    @ManyToOne(() => Afiliado, afiliado => afiliado.detallePlanilla, { cascade: true })
    @JoinColumn({ name: 'id_afiliado' })
    afiliado: Afiliado;

    @ManyToOne(() => Planilla, planilla => planilla.detallePlanilla, { cascade: true })
    @JoinColumn({ name: 'id_planilla' })
    planilla: Planilla;
}