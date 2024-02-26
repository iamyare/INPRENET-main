import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_ReferenciaPersonalAfiliado } from "./referenciaP-Afiliado";

@Entity()
export class Net_ReferenciaPersonal {

    @PrimaryGeneratedColumn('uuid')
    id_ref_personal : string;

    
    @Column('varchar2', {
        length : 50,
        nullable : false
    })
    nombre : string;

    @Column('varchar2', {
        length : 200,
        nullable : false
    })
    direccion : string;

    @Column('varchar2', {
        length : 30,
        nullable : false
    })
    parentesco : string;

    @Column('varchar2', {
        length : 40,
        nullable : true
    })
    telefono_domicilio : string;

    @Column('varchar2', {
        length : 12,
        nullable : false
    })
    telefono_trabajo : string;

    @Column('varchar2', {
        length : 12,
        nullable : false
    })
    telefono_celular : string;

    @OneToMany(() => Net_ReferenciaPersonalAfiliado, referenciaPersonalAfiliado => referenciaPersonalAfiliado.referenciaPersonal)
    referenciasPersonalesAfiliado: Net_ReferenciaPersonalAfiliado[];

}