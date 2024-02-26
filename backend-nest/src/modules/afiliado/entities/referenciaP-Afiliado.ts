import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ReferenciaPersonal } from "./referencia-personal";
import { Net_Afiliado } from "./net_afiliado";

@Entity()
export class ReferenciaPersonalAfiliado {

    @PrimaryGeneratedColumn('uuid')
    id_ReferenciaPersonalAfiliado : string;

    @ManyToOne(() => Net_Afiliado, afiliado => afiliado.referenciasPersonalAfiliado)
    @JoinColumn({ name: 'id_afiliado'})
    afiliado: Net_Afiliado;

    @ManyToOne(() => ReferenciaPersonal, referenciaPersonal => referenciaPersonal.referenciasPersonalesAfiliado)
    referenciaPersonal: ReferenciaPersonal;
}