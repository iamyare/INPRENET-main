import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Net_Persona } from "./Net_Persona.entity";
import { Net_Tipo_Persona } from "./net_tipo_persona.entity";

@Entity({name:'NET_DETALLE_PERSONA'})
export class NET_DETALLE_PERSONA {
    @PrimaryColumn({ name: 'ID_PERSONA', type: 'int', primaryKeyConstraintName: 'PK_ID_PERSONA_DETALLE_PERSONA' })
    ID_PERSONA: number;
    
    @PrimaryColumn({ name: 'ID_CAUSANTE', type: 'int', primaryKeyConstraintName: 'PK_ID_PERSONA_DETALLE_PERSONA' })
    ID_CAUSANTE: number;

    @Column({ type: 'number', nullable: true, name: 'PORCENTAJE' })
    porcentaje: number;

    @ManyToOne(() => Net_Persona, persona => persona.detallePersona)
    @JoinColumn({ name: 'ID_PERSONA', referencedColumnName: 'id_persona', foreignKeyConstraintName: "FK_ID_PERSONA_DETPER" })
    persona: Net_Persona;

    @ManyToOne(() => NET_DETALLE_PERSONA, detallePersona => detallePersona.hijos, { cascade: true })
    @JoinColumn({ name: 'ID_CAUSANTE_PADRE', referencedColumnName: 'ID_PERSONA', foreignKeyConstraintName: "FK_ID_PERSONA_DETALLE_PERSONA" })
    padreIdPersona: NET_DETALLE_PERSONA;

    @Column({ type: 'int', nullable: true, name: 'ID_CAUSANTE_PADRE' })
    ID_CAUSANTE_PADRE: number;

    @ManyToOne(() => Net_Tipo_Persona, tipoPersona => tipoPersona.detallesAfiliado)
    @JoinColumn({ name: 'ID_TIPO_PERSONA', foreignKeyConstraintName: "FK_ID_TIPO_PERSONA_DETALLE_PERSONA" })
    tipoAfiliado: Net_Tipo_Persona;

    @Column({ type: 'int', nullable: true, name: 'ID_TIPO_PERSONA' })
    ID_TIPO_PERSONA: number;

    @OneToMany(() => NET_DETALLE_PERSONA, detallePersona => detallePersona.padreIdPersona)
    hijos: NET_DETALLE_PERSONA[];

}