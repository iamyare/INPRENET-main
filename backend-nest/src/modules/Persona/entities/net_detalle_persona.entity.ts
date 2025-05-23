import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Net_Tipo_Persona } from "./net_tipo_persona.entity";
import { net_estado_afiliacion } from "./net_estado_afiliacion.entity";
import { net_persona } from "./net_persona.entity";
import { Net_Detalle_Beneficio_Afiliado } from "src/modules/Planilla/detalle_beneficio/entities/net_detalle_beneficio_afiliado.entity";

@Entity({ name: 'NET_DETALLE_PERSONA' })
@Check(`ELIMINADO IN ('SI', 'NO')`)
export class net_detalle_persona {
    @PrimaryColumn({ name: 'ID_PERSONA' })
    ID_PERSONA: number;

    @PrimaryGeneratedColumn({ name: 'ID_DETALLE_PERSONA' })
    ID_DETALLE_PERSONA: number;

    @PrimaryColumn({ name: 'ID_CAUSANTE' })
    ID_CAUSANTE: number;

    @Column('number', { nullable: true, name: 'PORCENTAJE' })
    porcentaje: number;

    @Column('varchar2', { length: 2, nullable: true, name: 'ELIMINADO', default: "NO" })
    eliminado: string;

    @ManyToOne(() => net_persona, persona => persona.detallePersona)
    @JoinColumn({ name: 'ID_PERSONA', referencedColumnName: 'id_persona' })
    persona: net_persona;

    // Relación Muchos a Uno consigo mismo
    @ManyToOne(() => net_detalle_persona, detalleAfiliado => detalleAfiliado.persona, { cascade: true })
    @JoinColumn({ name: 'ID_CAUSANTE_PADRE', referencedColumnName: 'ID_CAUSANTE', foreignKeyConstraintName: 'FK_ID_CAUSANTE_DET_PER' })
    @JoinColumn({ name: 'ID_CAUSANTE', referencedColumnName: 'ID_PERSONA', foreignKeyConstraintName: 'FK_ID_PERSONA_DET_PER' })
    @JoinColumn({ name: 'ID_DETALLE_PERSONA', referencedColumnName: 'ID_DETALLE_PERSONA', foreignKeyConstraintName: 'FK_ID_DETALLE_PERSONA_DET_PER' })
    padreIdPersona: net_detalle_persona;

    @ManyToOne(() => Net_Tipo_Persona, tipoPersona => tipoPersona.detallesPersona)
    @JoinColumn({ name: 'ID_TIPO_PERSONA' })
    tipoPersona: Net_Tipo_Persona;

    @Column({ type: 'int', nullable: true, name: 'ID_TIPO_PERSONA' })
    ID_TIPO_PERSONA: number;

    @Column({ type: 'int', nullable: true, name: 'ID_CAUSANTE_PADRE' })
    ID_CAUSANTE_PADRE: number;

    @ManyToOne(() => net_estado_afiliacion, estadoAfiliacion => estadoAfiliacion.persona)
    @JoinColumn({ name: 'ID_ESTADO_AFILIACION', foreignKeyConstraintName: 'FK_ID_ESTADO_AFILIAC_DET_PER' })
    estadoAfiliacion: net_estado_afiliacion;

    @OneToMany(() => Net_Detalle_Beneficio_Afiliado, detalleBenAfil => detalleBenAfil.persona)
    detalleBeneficio: Net_Detalle_Beneficio_Afiliado[];

    @Column({ type: 'int', nullable: true, name: 'ID_ESTADO_AFILIACION' })
    ID_ESTADO_AFILIACION: number;
}
