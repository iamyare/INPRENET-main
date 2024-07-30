import { Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Planilla } from "../../planilla/entities/net_planilla.entity";
import { Net_Detalle_Beneficio_Afiliado } from "./net_detalle_beneficio_afiliado.entity";
import { Net_Detalle_Deduccion } from "../../detalle-deduccion/entities/detalle-deduccion.entity";
import { Net_Persona_Por_Banco } from "src/modules/banco/entities/net_persona-banco.entity";

@Entity({ name: 'NET_DETALLE_PAGO_BENEFICIO' })
@Check("CK_ESTADO_DETBEN", `ESTADO IN ('PAGADA', 'NO PAGADA', 'EN PRELIMINAR', 'EN PLANILLA')`)
@Check("CK_PROCESO", `PROCESO IN ('ORDINARIA - JUBILADOS', 'ORDINARIA - BENEFICIARIOS', 'COMPLEMENTARIA - JUBILADOS', 'COMPLEMENTARIA - BENEFICIARIOS')`)
export class Net_Detalle_Pago_Beneficio {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_BENEFICIO_PLANILLA', primaryKeyConstraintName: 'PK_BENPLAN_DETPLANB' })
    id_beneficio_planilla: number;

    @Column({ default: "NO PAGADA", name: 'ESTADO' })
    estado: string;

    @CreateDateColumn({ name: 'FECHA_CARGA' })
    fecha_carga: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'MONTO_A_PAGAR' })
    monto_a_pagar: number;

    @Column({ type: 'varchar2', length: 30, nullable: true, name: 'PROCESO' })
    proceso: string;

    @ManyToOne(() => Net_Planilla, planilla => planilla.detallepagobeneficio, { cascade: true })
    @JoinColumn({ name: 'ID_PLANILLA', foreignKeyConstraintName: "FK_ID_PLANILLA_DETPAGBEN" })
    planilla: Net_Planilla;

    @ManyToOne(() => Net_Persona_Por_Banco, personaPorbanco => personaPorbanco.detallePagoBen, { cascade: true })
    @JoinColumn({ name: 'ID_AF_BANCO', foreignKeyConstraintName: "FK_ID_AF_BANCO_DETPAGBEN" })
    personaporbanco: Net_Persona_Por_Banco;

    @ManyToOne(() => Net_Detalle_Beneficio_Afiliado, detalleBeneficioAfiliado => detalleBeneficioAfiliado.detallePagBeneficio, { cascade: true })
    @JoinColumn({ name: 'ID_PERSONA', referencedColumnName: 'ID_PERSONA', foreignKeyConstraintName: "FK_ID_BEN_PLAN_AFIL_DETPAGBEN" })
    @JoinColumn({ name: 'ID_CAUSANTE', referencedColumnName: 'ID_CAUSANTE', foreignKeyConstraintName: "FK_ID_BEN_PLAN_AFIL_DETPAGBEN" })
    @JoinColumn({ name: 'ID_DETALLE_PERSONA', referencedColumnName: 'ID_DETALLE_PERSONA', foreignKeyConstraintName: "FK_ID_BEN_PLAN_AFIL_DETPAGBEN" })
    @JoinColumn({ name: 'ID_BENEFICIO', referencedColumnName: 'ID_BENEFICIO', foreignKeyConstraintName: "FK_ID_BEN_PLAN_AFIL_DETPAGBEN" })
    detalleBeneficioAfiliado: Net_Detalle_Beneficio_Afiliado[];
}

