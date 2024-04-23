import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Net_Persona } from "./Net_Persona.entity";
import { Net_Tipo_Persona } from "./net_tipo_persona.entity";

@Entity({name:'NET_DETALLE_PERSONA'})
export class NET_DETALLE_PERSONA {
    @PrimaryColumn({name :'ID_PERSONA', primaryKeyConstraintName: 'PK_ID_PERSONA_DETALLE_PERSONA' })
    ID_PERSONA: number;
    
    @PrimaryColumn({name:'ID_CAUSANTE', primaryKeyConstraintName: 'PK_ID_PERSONA_DETALLE_PERSONA'})
    ID_CAUSANTE: number;

    @Column('number', { nullable: true, name:'PORCENTAJE' })
    porcentaje: number;
    
    @ManyToOne(() => Net_Persona, persona => persona.detallePersona, )
    @JoinColumn({ name: 'ID_PERSONA', referencedColumnName: 'id_persona', foreignKeyConstraintName:"FK_ID_PERSONA_DETPER" })
    persona: Net_Persona;
    
    // Relación Muchos a Uno consigo mismo
    @ManyToOne(() => NET_DETALLE_PERSONA, detallePersona => detallePersona.persona, { cascade: true })
    @JoinColumn({ name: 'ID_CAUSANTE_PADRE', referencedColumnName: 'ID_PERSONA', foreignKeyConstraintName:"FK_ID_PERSONA_DETALLE_PERSONA"})
    @JoinColumn({ name: 'ID_CAUSANTE', referencedColumnName: 'ID_CAUSANTE', foreignKeyConstraintName:"FK_ID_PERSONA_DETALLE_PERSONA"})
    padreIdPersona: NET_DETALLE_PERSONA;

    @ManyToOne(() => Net_Tipo_Persona, tipoAfiliado => tipoAfiliado.detallesAfiliado)
    @JoinColumn({ name: 'ID_TIPO_PERSONA', foreignKeyConstraintName:"FK_ID_TIPO_PERSONA_DETALLE_PERSONA"}) 
    tipoAfiliado: Net_Tipo_Persona;

}