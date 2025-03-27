import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Deduccion } from "../../deduccion/entities/net_deduccion.entity";
import { Net_TipoPlanilla } from "../../tipo-planilla/entities/tipo-planilla.entity";
import { Net_Beneficio } from "../../beneficio/entities/net_beneficio.entity";
import { Net_Tipo_Persona } from "src/modules/Persona/entities/net_tipo_persona.entity";
import { Net_Planilla } from "./net_planilla.entity";
import { net_persona } from "src/modules/Persona/entities/net_persona.entity";
import { Net_Persona_Por_Banco } from "src/modules/banco/entities/net_persona-banco.entity";
import { Net_Detalle_Beneficio_Afiliado } from "../../detalle_beneficio/entities/net_detalle_beneficio_afiliado.entity";
import { Net_Detalle_Deduccion } from "../../detalle-deduccion/entities/detalle-deduccion.entity";
import { Net_Detalle_Pago_Beneficio } from "../../detalle_beneficio/entities/net_detalle_pago_beneficio.entity";

@Entity({ name: 'NET_BANCO_PLANILLA' })
export class Net_BANCO_PLANILLA {

    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_BANCO_PLANILLA', primaryKeyConstraintName: 'PK_ID_BANCO_PLANILLA' })
    id_banco_planilla: string;

    @Column({ type: 'int', nullable: false, name: 'ID_PERSONA' })
    id_persona: number;

    @Column({ type: 'int', nullable: false, name: 'ID_DETALLE_PERSONA' })
    id_detalle_persona: number;

    @Column({ type: 'int', nullable: false, name: 'ID_CAUSANTE' })
    id_causante: number;

    @Column({ type: 'int', nullable: false, name: 'ID_BENEFICIO' })
    id_beneficio: number;

    @Column({ type: 'int', nullable: false, name: 'ID_PLANILLA' })
    id_planilla: number;

    /* @ManyToOne(() => Net_Persona_Por_Banco, personaBanco => personaBanco.bancoPlanilla, { cascade: true })
    @JoinColumn({ name: 'ID_AF_BANCO', foreignKeyConstraintName: "FK_ID_AF_BANCO_PER_BANCO" })
    personaBanco: Net_Persona_Por_Banco;

    @ManyToOne(() => Net_Detalle_Pago_Beneficio, personaPlanilla => personaPlanilla.bancoPlanilla, { cascade: true })
    @JoinColumn({ name: 'ID_PERSONA', referencedColumnName: 'ID_PERSONA', foreignKeyConstraintName: 'FK_ID_PERSONA_BAN_PLAN' })
    @JoinColumn({ name: 'ID_DETALLE_PERSONA', referencedColumnName: 'ID_DETALLE_PERSONA', foreignKeyConstraintName: 'FK_ID_DETALLE_PERSONA_BAN_PLAN' })
    @JoinColumn({ name: 'ID_CAUSANTE', referencedColumnName: 'ID_CAUSANTE', foreignKeyConstraintName: 'FK_ID_CAUSANTE_BAN_PLAN' })
    @JoinColumn({ name: 'ID_BENEFICIO', referencedColumnName: 'ID_BENEFICIO', foreignKeyConstraintName: 'FK_ID_BENEFICIO_BAN_PLAN' })
    @JoinColumn({ name: 'ID_PLANILLA', referencedColumnName: 'ID_PLANILLA', foreignKeyConstraintName: 'FK_ID_PLANILLA_BAN_PLAN' })
    personaPlanilla: Net_Detalle_Pago_Beneficio; */

    /* 
        @OneToMany(() => Net_Detalle_Pago_Beneficio, detallePagBenAfil => detallePagBenAfil.bancoPlanilla)
        detalleBenAfil: Net_Detalle_Pago_Beneficio[]; 
    */
    /*
        @ManyToOne(() => Net_Planilla, planilla => planilla.bancoPlanilla, { cascade: true })
        @JoinColumn({ name: 'ID_PLANILLA', foreignKeyConstraintName: "FK_ID_PLANILLA_BAN_PLAN" })
        planilla: Net_Planilla;
    
        @OneToMany(() => Net_Detalle_Deduccion, detalleDeduccion => detalleDeduccion.bancoPlanilla)
        detalleDed: Net_Detalle_Deduccion[]; 
    */
}