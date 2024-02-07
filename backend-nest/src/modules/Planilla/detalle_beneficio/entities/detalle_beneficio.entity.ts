import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Beneficio } from "../../beneficio/entities/beneficio.entity";
import { Afiliado } from "src/afiliado/entities/afiliado";
import { Planilla } from "../../planilla/entities/planilla.entity";

@Entity()
export class DetalleBeneficio {

    @PrimaryGeneratedColumn('uuid')
    id_beneficio_planilla : string;

    @Column({default:"NO PAGADO"})
    estado: string;

    @Column({nullable:true})
    modalidad_pago: string;

    @Column({nullable:true})
    monto: number;
    
    @Column({nullable:true})
    num_rentas_aplicadas: number;

    @Column({ type: 'date', nullable: false })
    periodoInicio: Date;

    @Column({ type: 'date', nullable: false })
    periodoFinalizacion: Date;

    @ManyToOne(() => Beneficio, beneficio => beneficio.detallebeneficio, { cascade : true })
    @JoinColumn({ name: 'id_beneficio'})
    beneficio : Beneficio;

    @ManyToOne(() => Afiliado, afiliado => afiliado.detalleBeneficio, { cascade : true })
    @JoinColumn({ name: 'id_afiliado'})
    afiliado : Afiliado;

    @ManyToOne(() => Planilla, planilla => planilla.detallebeneficio, { cascade: true })
    @JoinColumn({ name: 'id_planilla' })
    planilla: Planilla;

}