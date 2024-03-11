
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Beneficio } from "../../beneficio/entities/net_beneficio.entity";
import { Net_Detalle_Pago_Beneficio } from "./net_detalle_pago_beneficio.entity";
import { Net_Detalle_Afiliado } from "src/modules/afiliado/entities/detalle_afiliado.entity";

@Entity()
export class Net_Detalle_Beneficio_Afiliado 
{
    @PrimaryGeneratedColumn('uuid')
    ID_DETALLE_BEN_AFIL: string;

    @Column({ type: 'date', nullable: false })
    PERIODO_INICIO: Date;

    @Column({ type: 'date', nullable: false })
    PERIODO_FINALIZACION: Date;

    @Column({nullable:true, default: 0 })
    NUM_RENTAS_APLICACDAS: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    MONTO_TOTAL: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    MONTO_POR_PERIODO: number;
    
    @Column({nullable:true})
    METODO_PAGO: string;

    /*  @ManyToOne(() => Net_Persona, afiliado => afiliado.detalleBeneficioAfiliado)
    @JoinColumn({ name: 'id_afiliado' })
    afiliado: string; */

    @ManyToOne(() => Net_Beneficio, beneficio => beneficio.detalleBeneficioAfiliado)
    @JoinColumn({ name: 'ID_BENEFICIO' })
    beneficio: Net_Beneficio;

    @OneToMany(() => Net_Detalle_Pago_Beneficio, detalleBeneficio => detalleBeneficio.detalleBeneficioAfiliado)
    detalleBeneficio: Net_Detalle_Pago_Beneficio[];

     @ManyToOne(() => Net_Detalle_Afiliado, afiliado => afiliado.detalleBeneficioAfiliado)
     @JoinColumn({ name: 'ID_CAUSANTE', referencedColumnName: 'ID_AFILIADO'})
     @JoinColumn({ name: 'ID_BENEFICIARIO', referencedColumnName: 'ID_DETALLE_AFILIADO'})
     afiliado: string;
}