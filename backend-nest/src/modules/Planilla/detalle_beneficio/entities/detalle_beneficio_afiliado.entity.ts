import { Afiliado } from "src/afiliado/entities/afiliado";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Beneficio } from "../../beneficio/entities/beneficio.entity";
import { DetalleBeneficio } from "./detalle_beneficio.entity";

@Entity()
export class DetalleBeneficioAfiliado 
{
    @PrimaryGeneratedColumn('uuid')
    id_detalle_ben_afil: string;

    @Column({ type: 'date', nullable: false })
    periodoInicio: Date;

    @Column({ type: 'date', nullable: false })
    periodoFinalizacion: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    monto_total: number;

    @ManyToOne(() => Afiliado, afiliado => afiliado.detalleBeneficioAfiliado)
    @JoinColumn({ name: 'id_afiliado' })
    afiliado: Afiliado;;

    @ManyToOne(() => Beneficio, beneficio => beneficio.detalleBeneficioAfiliado)
    @JoinColumn({ name: 'id_beneficio' })
    beneficio: Beneficio;

    @OneToMany(() => DetalleBeneficio, detalleBeneficio => detalleBeneficio.detalleBeneficioAfiliado)
    detalleBeneficio: DetalleBeneficio[];
}