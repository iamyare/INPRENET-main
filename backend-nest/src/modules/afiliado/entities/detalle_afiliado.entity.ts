import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Net_Persona } from "./Net_Persona";
import { Net_Tipo_Afiliado } from "./net_tipo_afiliado.entity";

@Entity({name:'NET_DETALLE_PERSONA'})
export class Net_Detalle_Afiliado {
    @PrimaryColumn({name :'ID_PERSONA', primaryKeyConstraintName: 'PK_ID_PERSONA_DETALLE_PERSONA' })
    ID_PERSONA: number;
    
    @PrimaryColumn({name:'ID_BENEFICIARIO', primaryKeyConstraintName: 'PK_ID_PERSONA_DETALLE_PERSONA'})
    ID_BENEFICIARIO: number;

    @Column('number', { nullable: true, name:'PORCENTAJE' })
    porcentaje: number;
    
    @ManyToOne(() => Net_Persona, afiliado => afiliado.detalleAfiliado, )
    @JoinColumn({ name: 'ID_PERSONA', referencedColumnName: 'id_persona', foreignKeyConstraintName:"FK_ID_PERSONA_DETPER" })
    afiliado: Net_Persona;
    
    // Relación Muchos a Uno consigo mismo
    @ManyToOne(() => Net_Detalle_Afiliado, detalleAfiliado => detalleAfiliado.afiliado, { cascade: true })
    @JoinColumn({ name: 'ID_PERSONA_PADRE', referencedColumnName: 'ID_PERSONA', foreignKeyConstraintName:"FK_ID_PERSONA_DETALLE_PERSONA"})
    @JoinColumn({ name: 'ID_BENEFICIARIO', referencedColumnName: 'ID_BENEFICIARIO', foreignKeyConstraintName:"FK_ID_PERSONA_DETALLE_PERSONA"})
    padreIdAfiliado: Net_Detalle_Afiliado;

    @ManyToOne(() => Net_Tipo_Afiliado, tipoAfiliado => tipoAfiliado.detallesAfiliado)
    @JoinColumn({ name: 'ID_TIPO_AFILIADO', foreignKeyConstraintName:"FK_ID_TIPO_AFILIADO_DETALLE_PERSONA"}) 
    tipoAfiliado: Net_Tipo_Afiliado;

}