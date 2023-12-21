import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Banco } from "./banco.entity";
import { Afiliado } from "src/afiliado/entities/afiliado.entity";

@Entity()
export class AfiliadosPorBanco {
    @PrimaryGeneratedColumn('uuid')
    id_af_banco : string;
    
    @Column('varchar2', {unique: true ,nullable: false, length:20})
    num_cuenta


    @ManyToOne(() => Banco, banco => banco.afiliadosDeBanco)
    banco : Banco;

    @ManyToOne(() => Afiliado, afiliado => afiliado.afiliadosPorBanco)
    afiliado : Afiliado;


}