import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Planilla } from "../../planilla/entities/planilla.entity";
import { Beneficio } from "../../beneficio/entities/beneficio.entity";
import { Afiliado } from "src/afiliado/entities/afiliado.entity";

@Entity()
export class BeneficioPlanilla {

    @PrimaryGeneratedColumn('uuid')
    id_beneficio_planilla : string;

    @Column()
    monto: string;

    @Column()
    periodoPago: string;

    @Column()
    estado: string;

    @ManyToOne(() => Planilla, planilla => planilla.beneficioPlanilla, { cascade : true })
    @JoinColumn({ name: 'id_planilla'})
    planilla : Planilla;

    @ManyToOne(() => Beneficio, beneficio => beneficio.beneficioPlanilla, { cascade : true })
    @JoinColumn({ name: 'id_beneficio'})
    beneficio : Beneficio;

    @ManyToOne(() => Afiliado, afiliado => afiliado.beneficioPlanilla, { cascade : true })
    @JoinColumn({ name: 'id_afiliado'})
    afiliado : Afiliado;
}
