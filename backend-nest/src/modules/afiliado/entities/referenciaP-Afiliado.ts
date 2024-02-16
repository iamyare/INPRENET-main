import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ReferenciaPersonal } from "./referencia-personal";
import { Afiliado } from "./afiliado";

@Entity()
export class ReferenciaPersonalAfiliado {

    @PrimaryGeneratedColumn('uuid')
    id_ReferenciaPersonalAfiliado : string;

    @ManyToOne(() => Afiliado, afiliado => afiliado.referenciasPersonalAfiliado)
    @JoinColumn({ name: 'id_afiliado'})
    afiliado: Afiliado;

    @ManyToOne(() => ReferenciaPersonal, referenciaPersonal => referenciaPersonal.referenciasPersonalesAfiliado)
    referenciaPersonal: ReferenciaPersonal;
}