import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Net_ReferenciaPersonal } from "./referencia-personal";
import { Net_Afiliado } from "./net_afiliado";

@Entity()
export class Net_Ref_Personal_Afiliado {

    @PrimaryGeneratedColumn('uuid')
    refPersonalIdRefPersonal : string;

    @ManyToOne(() => Net_Afiliado, afiliado => afiliado.referenciasPersonalAfiliado)
    @JoinColumn({ name: 'id_afiliado'})
    afiliado: Net_Afiliado;

    @ManyToOne(() => Net_ReferenciaPersonal, referenciaPersonal => referenciaPersonal.referenciasPersonalesAfiliado)
    referenciaPersonal: Net_ReferenciaPersonal;
}