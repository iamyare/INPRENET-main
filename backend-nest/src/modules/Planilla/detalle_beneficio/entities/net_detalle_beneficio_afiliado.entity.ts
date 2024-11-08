
import { Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Net_Beneficio } from "../../beneficio/entities/net_beneficio.entity";
import { Net_Detalle_Pago_Beneficio } from "./net_detalle_pago_beneficio.entity";
import { net_detalle_persona } from "src/modules/Persona/entities/net_detalle_persona.entity";
import { Net_Usuario_Empresa } from "src/modules/usuario/entities/net_usuario_empresa.entity";

@Entity({ name: 'NET_DETALLE_BENEFICIO_AFILIADO' })
@Check("CK_PRESTAMO_NET_DET_BEN_AFIL", `prestamo IN ('SI', 'NO')`)
export class Net_Detalle_Beneficio_Afiliado {
    @PrimaryColumn({ name: 'ID_DETALLE_PERSONA', primaryKeyConstraintName: 'PK_ID_DET_BEN_AFIL' })
    ID_DETALLE_PERSONA: number;

    @PrimaryColumn({ name: 'ID_PERSONA', primaryKeyConstraintName: 'PK_ID_DET_BEN_AFIL' })
    ID_PERSONA: number;

    @PrimaryColumn({ name: 'ID_CAUSANTE', primaryKeyConstraintName: 'PK_ID_DET_BEN_AFIL' })
    ID_CAUSANTE: number;

    @PrimaryColumn({ name: 'ID_BENEFICIO', primaryKeyConstraintName: 'PK_ID_DET_BEN_AFIL' })
    ID_BENEFICIO: number;

    @Column({ nullable: true, name: 'ESTADO_SOLICITUD' })
    estado_solicitud: string;

    @Column({ type: 'date', nullable: true, name: 'FECHA_CALCULO' })
    fecha_calculo: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'MONTO_TOTAL' })
    monto_total: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'MONTO_ULTIMA_CUOTA' })
    monto_ultima_cuota: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'MONTO_POR_PERIODO' })
    monto_por_periodo: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'MONTO_PRIMERA_CUOTA' })
    monto_primera_cuota: number;

    @Column({ nullable: true, name: 'METODO_PAGO' })
    metodo_pago: string;

    @Column({ type: 'date', nullable: true, name: 'PERIODO_INICIO' })
    periodo_inicio: Date;

    @Column({ type: 'date', nullable: true, name: 'PERIODO_FINALIZACION' })
    periodo_finalizacion: Date;

    @Column({ nullable: true, name: 'RECIBIENDO_BENEFICIO' })
    recibiendo_beneficio: string;

    @Column({ nullable: true, name: 'OBSERVACIONES' })
    observaciones: string;

    @Column({ nullable: true, name: 'PRESTAMO' })
    prestamo: string;

    @Column({ nullable: true, default: 0, name: 'NUM_RENTAS_APLICADAS' })
    num_rentas_aplicadas: number;

    @Column({ nullable: true, default: 0, name: 'NUM_RENTAS_PAGAR_PRIMER_PAGO' })
    num_rentas_pagar_primer_pago: number;

    @Column({ nullable: true, name: 'ULTIMO_DIA_ULTIMA_RENTA' })
    ultimo_dia_ultima_renta: number;


    @ManyToOne(() => Net_Beneficio, beneficio => beneficio.detalleBeneficioAfiliado)
    @JoinColumn({ name: 'ID_BENEFICIO', foreignKeyConstraintName: "FK_ID_BENEFICIO_DETBENAFIL" })
    beneficio: Net_Beneficio;

    @OneToMany(() => Net_Detalle_Pago_Beneficio, detalleBeneficio => detalleBeneficio.detalleBeneficioAfiliado)
    detallePagBeneficio: Net_Detalle_Pago_Beneficio[];

    @ManyToOne(() => net_detalle_persona, persona => persona.padreIdPersona)
    @JoinColumn({ name: 'ID_PERSONA', referencedColumnName: 'ID_PERSONA', foreignKeyConstraintName: "FK_ID_DET_BEN_DET_PERS" })
    @JoinColumn({ name: 'ID_CAUSANTE', referencedColumnName: 'ID_CAUSANTE', foreignKeyConstraintName: "FK_ID_DET_BEN_DET_PERS" })
    @JoinColumn({ name: 'ID_DETALLE_PERSONA', referencedColumnName: 'ID_DETALLE_PERSONA', foreignKeyConstraintName: "FK_ID_DET_BEN_DET_PERS" })
    persona: net_detalle_persona[];

    @ManyToOne(() => Net_Usuario_Empresa, { nullable: true })
    @JoinColumn({ name: 'ID_USUARIO_EMPRESA', referencedColumnName: 'id_usuario_empresa', foreignKeyConstraintName: 'FK_ID_USUARIO_EMPRESA_DET_BEN_AFILIADO' })
    usuarioEmpresa: Net_Usuario_Empresa;

    @Column({ type: 'int', nullable: true, name: 'ID_USUARIO_EMPRESA' })
    ID_USUARIO_EMPRESA: number;
}