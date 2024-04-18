
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Beneficio } from "../../beneficio/entities/net_beneficio.entity";
import { Net_Detalle_Pago_Beneficio } from "./net_detalle_pago_beneficio.entity";
import { NET_DETALLE_PERSONA } from "src/modules/afiliado/entities/Net_detalle_persona.entity";

@Entity({ name: 'NET_DETALLE_BENEFICIO_AFILIADO' })
export class Net_Detalle_Beneficio_Afiliado {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_DETALLE_BEN_AFIL', primaryKeyConstraintName: 'PK_id_detBen_detBA' })
    id_detalle_ben_afil: number;

    @Column({ type: 'date', nullable: false, name: 'PERIODO_INICIO' })
    periodo_inicio: Date;

    @Column({ type: 'date', nullable: false, name: 'PERIODO_FINALIZACION' })
    periodo_finalizacion: Date;

    @Column({ nullable: true, default: 0, name: 'NUM_RENTAS_APLICADAS' })
    num_rentas_aplicadas: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'MONTO_TOTAL' })
    monto_total: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'MONTO_POR_PERIODO' })
    monto_por_periodo: number;

    @Column({ nullable: true, name: 'METODO_PAGO' })
    metodo_pago: string;

    @ManyToOne(() => Net_Beneficio, beneficio => beneficio.detalleBeneficioAfiliado)
    @JoinColumn({ name: 'ID_BENEFICIO', foreignKeyConstraintName: "FK_ID_BENEFICIO_DETBENAFIL" })
    beneficio: Net_Beneficio;

    @OneToMany(() => Net_Detalle_Pago_Beneficio, detalleBeneficio => detalleBeneficio.detalleBeneficioAfiliado)
    detalleBeneficio: Net_Detalle_Pago_Beneficio[];

    @ManyToOne(() => NET_DETALLE_PERSONA, afiliado => afiliado.padreIdAfiliado)
    @JoinColumn({ name: 'ID_CAUSANTE', referencedColumnName: 'ID_CAUSANTE' })
    @JoinColumn({ name: 'ID_BENEFICIARIO', referencedColumnName: 'ID_PERSONA' })
    afiliado: NET_DETALLE_PERSONA[];
}