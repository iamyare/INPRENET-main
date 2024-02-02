import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Beneficio } from "../../beneficio/entities/beneficio.entity";
import { Afiliado } from "src/afiliado/entities/afiliado";
import { DetallePlanilla } from "../../planilla/entities/detalle_planilla.entity";

@Entity()
export class BeneficioPlanilla {

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

    @Column('varchar2', { length: 200, nullable: false })
    periodoInicio: string;

    @Column('varchar2', { length: 200, nullable: false })
    periodoFinalizacion: string;


    @ManyToOne(() => Beneficio, beneficio => beneficio.beneficioPlanilla, { cascade : true })
    @JoinColumn({ name: 'id_beneficio'})
    beneficio : Beneficio;

    @ManyToOne(() => Afiliado, afiliado => afiliado.beneficioPlanilla, { cascade : true })
    @JoinColumn({ name: 'id_afiliado'})
    afiliado : Afiliado;

    @OneToMany(() => DetallePlanilla, detallePlanilla => detallePlanilla.beneficioPlanilla)
    detallePlanilla: DetallePlanilla[];

}