import { Afiliado } from "src/afiliado/entities/afiliado.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Provincia } from "./provincia";

@Entity()
export class Pais {

    @PrimaryGeneratedColumn('uuid')
    id_pais : string;

    @Column('varchar2', { length: 20, nullable: false })
    nombre : string;

    @Column('varchar2', { length: 20, nullable: false })
    nacionalidad : string;

    @OneToMany(() => Afiliado, afiliado => afiliado.pais)
    afiliado: Afiliado[];

    @OneToMany(() => Provincia, provincia => provincia.pais)
    provincia: Provincia[];
}
