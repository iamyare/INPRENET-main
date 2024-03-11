import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Provincia } from "../../provincia/entities/net_provincia.entity";
import { Net_Persona } from "src/modules/afiliado/entities/Net_Persona";

@Entity({name:'NET_PAIS'})
export class Net_Pais {

    @PrimaryGeneratedColumn('uuid', {name:'ID_PAIS'})
     id_pais: string;

    @Column('varchar2', { length: 20, nullable: false, name:'NOMBRE_PAIS' })
    nombre_pais : string;

    @Column('varchar2', { length: 20, nullable: false, name:'NACIONALIDAD' })
    nacionalidad : string;
    
    @OneToMany(() => Net_Persona, afiliado => afiliado.pais)
    afiliado: Net_Persona[];

    @OneToMany(() => Net_Provincia, provincia => provincia.pais)
    provincia: Net_Provincia[];
}
