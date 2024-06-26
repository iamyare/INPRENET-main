import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Net_Persona } from "./Net_Persona.entity";
import { Net_Tipo_Persona } from "./net_tipo_persona.entity";
import { Net_Estado_Persona } from "./net_estado_persona.entity";

@Entity({ name: 'NET_DETALLE_PERSONA' })
@Check(`ELIMINADO IN ('SI', 'NO')`)
export class NET_DETALLE_PERSONA {
    @PrimaryColumn({ name: 'ID_PERSONA', primaryKeyConstraintName: 'PK_ID_PERSONA_DETALLE_PERSONA' })
    ID_PERSONA: number;

    @PrimaryGeneratedColumn({ name: 'ID_DETALLE_PERSONA', primaryKeyConstraintName: 'PK_ID_PERSONA_DETALLE_PERSONA' })
    ID_DETALLE_PERSONA: number;

    @PrimaryColumn({ name: 'ID_CAUSANTE', primaryKeyConstraintName: 'PK_ID_PERSONA_DETALLE_PERSONA' })
    ID_CAUSANTE: number;

    @Column('number', { nullable: true, name: 'PORCENTAJE' })
    porcentaje: number;

    @Column('varchar2', { nullable: true, name: 'ELIMINADO', default: "NO" })
    eliminado: string;

    @ManyToOne(() => Net_Persona, persona => persona.detallePersona,)
    @JoinColumn({ name: 'ID_PERSONA', referencedColumnName: 'id_persona', foreignKeyConstraintName: "FK_ID_PERSONA_DETPER" })
    persona: Net_Persona;

    // Relación Muchos a Uno consigo mismo
    @ManyToOne(() => NET_DETALLE_PERSONA, detalleAfiliado => detalleAfiliado.persona, { cascade: true })
    @JoinColumn({ name: 'ID_CAUSANTE_PADRE', referencedColumnName: 'ID_CAUSANTE', foreignKeyConstraintName: "FK_ID_PERSONA_DETALLE_PERSONA" })
    @JoinColumn({ name: 'ID_CAUSANTE', referencedColumnName: 'ID_PERSONA', foreignKeyConstraintName: "FK_ID_PERSONA_DETALLE_PERSONA" })
    @JoinColumn({ name: 'ID_DETALLE_PERSONA', referencedColumnName: 'ID_DETALLE_PERSONA', foreignKeyConstraintName: "FK_ID_PERSONA_DETALLE_PERSONA" })
    padreIdPersona: NET_DETALLE_PERSONA;

    @ManyToOne(() => Net_Tipo_Persona, tipoPersona => tipoPersona.detallesPersona)
    @JoinColumn({ name: 'ID_TIPO_PERSONA', foreignKeyConstraintName: "FK_ID_TIPO_PERSONA_DETALLE_PERSONA" })
    tipoPersona: Net_Tipo_Persona;

    @Column({ type: 'int', nullable: true, name: 'ID_TIPO_PERSONA' })
    ID_TIPO_PERSONA: number;

    @Column({ type: 'int', nullable: true, name: 'ID_CAUSANTE_PADRE' })
    ID_CAUSANTE_PADRE: number;

    @ManyToOne(() => Net_Estado_Persona, estadoAfiliacion => estadoAfiliacion.persona)
    @JoinColumn({ name: 'ID_ESTADO_AFILIACION', foreignKeyConstraintName: "FK_ID_ESTADO_PERSONA_DETALLE_PERSONA" })
    estadoAfiliacion: Net_Estado_Persona;

}