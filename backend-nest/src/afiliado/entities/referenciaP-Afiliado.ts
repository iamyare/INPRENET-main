import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Afiliado } from "./afiliado.entity";
import { ReferenciaPersonal } from "./referencia-personal";

@Entity()
export class ReferenciaPersonalAfiliado {

    @PrimaryGeneratedColumn('uuid')
    id_ReferenciaPersonalAfiliado : string;

    @ManyToOne(() => Afiliado, afiliado => afiliado.referenciasPersonalAfiliado)
    afiliado: Afiliado;

    @ManyToOne(() => ReferenciaPersonal, referenciaPersonal => referenciaPersonal.referenciasPersonalesAfiliado)
    referenciaPersonal: ReferenciaPersonal;
}