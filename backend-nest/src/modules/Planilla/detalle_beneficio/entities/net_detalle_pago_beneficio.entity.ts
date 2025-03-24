import { Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Net_Planilla } from "../../planilla/entities/net_planilla.entity";
import { Net_Detalle_Beneficio_Afiliado } from "./net_detalle_beneficio_afiliado.entity";
import { Net_Persona_Por_Banco } from "src/modules/banco/entities/net_persona-banco.entity";
import { Net_Usuario_Empresa } from "src/modules/usuario/entities/net_usuario_empresa.entity";
import { Net_BANCO_PLANILLA } from "../../planilla/entities/net_banco_planilla.entity";

@Entity({ name: 'NET_DETALLE_PAGO_BENEFICIO' })
@Check("CK_ESTADO_DETBEN", `ESTADO IN ('PAGADA', 'NO PAGADA', 'EN PRELIMINAR', 'RECHAZADO', 'ENVIADO A BANCO')`)
export class Net_Detalle_Pago_Beneficio {
    @Column({ type: 'int', name: 'ID_BENEFICIO_PLANILLA' })

    id_beneficio_planilla: number;
    @PrimaryColumn({ name: 'ID_PERSONA', primaryKeyConstraintName: 'PK_BENPLAN_DETPLAN_B' })
    ID_PERSONA: number;
    @PrimaryColumn({ name: 'ID_DETALLE_PERSONA', primaryKeyConstraintName: 'PK_BENPLAN_DETPLAN_B' })
    ID_DETALLE_PERSONA: number;
    @PrimaryColumn({ name: 'ID_CAUSANTE', primaryKeyConstraintName: 'PK_BENPLAN_DETPLAN_B' })
    ID_CAUSANTE: number;
    @PrimaryColumn({ name: 'ID_BENEFICIO', primaryKeyConstraintName: 'PK_BENPLAN_DETPLAN_B' })
    ID_BENEFICIO: number;
    @PrimaryColumn({ name: 'ID_PLANILLA', primaryKeyConstraintName: 'PK_BENPLAN_DETPLAN_B' })
    ID_PLANILLA: number;

    @Column({ default: "NO PAGADA", name: 'ESTADO' })
    estado: string;

    @Column({ name: 'OBSERVACION', nullable: true, })
    observacion: string;

    @CreateDateColumn({ name: 'FECHA_CARGA' })
    fecha_carga: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'MONTO_A_PAGAR' })
    monto_a_pagar: number;

    @ManyToOne(() => Net_Planilla, planilla => planilla.detallepagobeneficio, { cascade: true })
    @JoinColumn({ name: 'ID_PLANILLA', foreignKeyConstraintName: "FK_ID_PLANILLA_DETPAGBEN" })
    planilla: Net_Planilla;

    /* @ManyToOne(() => Net_Persona_Por_Banco, personaPorbanco => personaPorbanco.detallePagoBen, { cascade: true })
    @JoinColumn({ name: 'ID_AF_BANCO', foreignKeyConstraintName: "FK_ID_AF_BANCO_DETPAGBEN" })
    personaporbanco: Net_Persona_Por_Banco; */

    @ManyToOne(() => Net_Detalle_Beneficio_Afiliado, detalleBeneficioAfiliado => detalleBeneficioAfiliado.detallePagBeneficio, { cascade: true })
    @JoinColumn({ name: 'ID_PERSONA', referencedColumnName: 'ID_PERSONA', foreignKeyConstraintName: "FK_ID_BEN_PLAN_AFIL_DETPAGBEN" })
    @JoinColumn({ name: 'ID_CAUSANTE', referencedColumnName: 'ID_CAUSANTE', foreignKeyConstraintName: "FK_ID_BEN_PLAN_AFIL_DETPAGBEN" })
    @JoinColumn({ name: 'ID_DETALLE_PERSONA', referencedColumnName: 'ID_DETALLE_PERSONA', foreignKeyConstraintName: "FK_ID_BEN_PLAN_AFIL_DETPAGBEN" })
    @JoinColumn({ name: 'ID_BENEFICIO', referencedColumnName: 'ID_BENEFICIO', foreignKeyConstraintName: "FK_ID_BEN_PLAN_AFIL_DETPAGBEN" })
    detalleBeneficioAfiliado: Net_Detalle_Beneficio_Afiliado[];

    @ManyToOne(() => Net_Usuario_Empresa, { nullable: true })
    @JoinColumn({ name: 'ID_USUARIO_EMPRESA', referencedColumnName: 'id_usuario_empresa', foreignKeyConstraintName: 'FK_ID_USUARIO_EMPRESA_DET_PAG_BENEFICIO' })
    usuarioEmpresa: Net_Usuario_Empresa;

    @Column({ type: 'int', nullable: true, name: 'ID_USUARIO_EMPRESA' })
    ID_USUARIO_EMPRESA: number;

    @OneToMany(() => Net_BANCO_PLANILLA, bancoPlanilla => bancoPlanilla.personaPlanilla)
    bancoPlanilla: Net_BANCO_PLANILLA[];

}

