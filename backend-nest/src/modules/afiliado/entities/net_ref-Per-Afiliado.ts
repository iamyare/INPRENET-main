import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Net_ReferenciaPersonal } from "./referencia-personal";
import { Net_Persona } from "./Net_Persona";

@Entity()
export class Net_Ref_Per_Afil {

    @PrimaryGeneratedColumn('uuid')
    ID_REF_PERSONAL_AFIL : string;

    @ManyToOne(() => Net_Persona, afiliado => afiliado.referenciasPersonalAfiliado)
    @JoinColumn({ name: 'ID_AFILIADO'})
    afiliado: Net_Persona;

    @ManyToOne(() => Net_ReferenciaPersonal, referenciaPersonal => referenciaPersonal.referenciasPersonalesAfiliado)
    @JoinColumn({ name: 'ID_REF_PERSONAL' })
    referenciaPersonal: Net_ReferenciaPersonal;
}