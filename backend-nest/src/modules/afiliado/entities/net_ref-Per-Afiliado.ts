import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Net_ReferenciaPersonal } from "./referencia-personal";
import { Net_Persona } from "./Net_Persona";

@Entity({name:'NET_REF_PER_AFIL'})
export class Net_Ref_Per_Afil {

    @PrimaryGeneratedColumn('uuid',{name: 'ID_REF_PERSONAL_AFIL'})
    id_ref_personal_afil: string;

    @ManyToOne(() => Net_Persona, afiliado => afiliado.referenciasPersonalAfiliado)
    @JoinColumn({ name: 'ID_PERSONA'})
    afiliado: Net_Persona;

    @ManyToOne(() => Net_ReferenciaPersonal, referenciaPersonal => referenciaPersonal.referenciasPersonalesAfiliado)
    @JoinColumn({ name: 'ID_REF_PERSONAL' })
    referenciaPersonal: Net_ReferenciaPersonal;
}