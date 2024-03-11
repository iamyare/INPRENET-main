import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Net_Persona } from "./Net_Persona";
import { Net_Tipo_Afiliado } from "./net_tipo_afiliado.entity";

@Entity({name:'NET_DETALLE_PERSONA'})
export class Net_Detalle_Afiliado {
    @PrimaryColumn({name :'ID_PERSONA'})
    id_persona: string;
    
    @PrimaryColumn({name:'ID_DETALLE_PERSONA'})
    id_detalle_persona: string;

    @Column('number', { nullable: true, name:'PORCENTAJE' })
    porcentaje: number;
    
    @ManyToOne(() => Net_Persona, persona => persona.detallesAfiliado)
    @JoinColumn({ name: 'ID_PERSONA', referencedColumnName: 'id_persona' })
    persona: Net_Persona;

    @ManyToOne(() => Net_Tipo_Afiliado, tipoAfiliado => tipoAfiliado.detallesAfiliado)
    @JoinColumn({ name: 'ID_TIPO_AFILIADO' }) 
    tipoAfiliado: Net_Tipo_Afiliado;

}