import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Provincia } from "../../provincia/entities/net_provincia.entity";
import { Net_Persona } from "src/modules/afiliado/entities/Net_Persona";

@Entity()
export class Net_Pais {

    @PrimaryGeneratedColumn('uuid')
    ID_PAIS : string;

    @Column('varchar2', { length: 20, nullable: false })
    NOMBRE_PAIS : string;

    @Column('varchar2', { length: 20, nullable: false })
    NACIONALIDAD : string;
    
    @OneToMany(() => Net_Persona, afiliado => afiliado.pais)
    afiliado: Net_Persona[];

    @OneToMany(() => Net_Provincia, provincia => provincia.pais)
    provincia: Net_Provincia[];
}
