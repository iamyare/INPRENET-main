
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Beneficio } from "../../beneficio/entities/beneficio.entity";
import { DetallePagoBeneficio } from "./detalle_pago_beneficio.entity";
import { Afiliado } from "src/modules/afiliado/entities/afiliado";

@Entity()
export class DetalleBeneficioAfiliado 
{
    @PrimaryGeneratedColumn('uuid')
    id_detalle_ben_afil: string;

    @Column({ type: 'date', nullable: false })
    periodoInicio: Date;

    @Column({ type: 'date', nullable: false })
    periodoFinalizacion: Date;

    @Column({nullable:true, default: 0 })
    num_rentas_aplicadas: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    monto_total: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    monto_por_periodo: number;

    @ManyToOne(() => Afiliado, afiliado => afiliado.detalleBeneficioAfiliado)
    @JoinColumn({ name: 'id_afiliado' })
    afiliado: Afiliado;;

    @ManyToOne(() => Beneficio, beneficio => beneficio.detalleBeneficioAfiliado)
    @JoinColumn({ name: 'id_beneficio' })
    beneficio: Beneficio;

    @OneToMany(() => DetallePagoBeneficio, detalleBeneficio => detalleBeneficio.detalleBeneficioAfiliado)
    detalleBeneficio: DetallePagoBeneficio[];
}