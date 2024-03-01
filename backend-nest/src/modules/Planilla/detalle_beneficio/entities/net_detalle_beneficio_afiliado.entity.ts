
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Beneficio } from "../../beneficio/entities/net_beneficio.entity";
import { Net_Detalle_Pago_Beneficio } from "./net_detalle_pago_beneficio.entity";
import { Net_Afiliado } from "src/modules/afiliado/entities/net_afiliado";

@Entity()
export class Net_Detalle_Beneficio_Afiliado 
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

    @ManyToOne(() => Net_Afiliado, afiliado => afiliado.detalleBeneficioAfiliado)
    @JoinColumn({ name: 'id_afiliado' })
    afiliado: string;

    @ManyToOne(() => Net_Beneficio, beneficio => beneficio.detalleBeneficioAfiliado)
    @JoinColumn({ name: 'id_beneficio' })
    beneficio: Net_Beneficio;

    @OneToMany(() => Net_Detalle_Pago_Beneficio, detalleBeneficio => detalleBeneficio.detalleBeneficioAfiliado)
    detalleBeneficio: Net_Detalle_Pago_Beneficio[];
}