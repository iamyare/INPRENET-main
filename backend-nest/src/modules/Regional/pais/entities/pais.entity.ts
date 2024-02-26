import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Provincia } from "../../provincia/entities/provincia.entity";
import { Net_Afiliado } from "src/modules/afiliado/entities/net_afiliado";

@Entity()
export class Pais {

    @PrimaryGeneratedColumn('uuid')
    id_pais : string;

    @Column('varchar2', { length: 20, nullable: false })
    nombre_pais : string;

    @Column('varchar2', { length: 20, nullable: false })
    nacionalidad : string;
    
    @OneToMany(() => Net_Afiliado, afiliado => afiliado.pais)
    afiliado: Net_Afiliado[];

    @OneToMany(() => Provincia, provincia => provincia.pais)
    provincia: Provincia[];
}
