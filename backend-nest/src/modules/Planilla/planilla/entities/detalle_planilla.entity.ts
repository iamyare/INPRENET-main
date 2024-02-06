import { Afiliado } from "src/afiliado/entities/afiliado";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Planilla } from "./planilla.entity";
import { DetalleDeduccion } from "../../detalle-deduccion/entities/detalle-deduccion.entity";
import { DetalleBeneficio } from "../../detalle_beneficio/entities/detalle_beneficio.entity";

@Entity()
export class DetallePlanilla {

    @PrimaryGeneratedColumn('uuid')
    id_detalle_planilla : string

    @Column('varchar2', { length: 200, nullable: false })
    estado : string

/*     @ManyToOne(() => Afiliado, afiliado => afiliado.detallePlanilla, { cascade: true })
    @JoinColumn({ name: 'id_afiliado' })
    afiliado: Afiliado;
 */
/*     @ManyToOne(() => Planilla, planilla => planilla.detallePlanilla, { cascade: true })
    @JoinColumn({ name: 'id_planilla' })
    planilla: Planilla; */
}