import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Ref_Per_Afil } from "./net_ref-Per-Afiliado";

@Entity()
export class Net_ReferenciaPersonal {

    @PrimaryGeneratedColumn('uuid')
    ID_REF_PERSONAL : string;

    
    @Column('varchar2', {
        length : 50,
        nullable : false
    })
    NOMBRE : string;

    @Column('varchar2', {
        length : 200,
        nullable : false
    })
    DIRECCION : string;

    @Column('varchar2', {
        length : 30,
        nullable : false
    })
    PARENTESCO : string;

    @Column('varchar2', {
        length : 40,
        nullable : true
    })
    TELEFONO_DOMICILIO : string;

    @Column('varchar2', {
        length : 12,
        nullable : false
    })
    TELEFONO_TRABAJO : string;

    @Column('varchar2', {
        length : 12,
        nullable : false
    })
    TELEFONO_CELULAR : string;

    @OneToMany(() => Net_Ref_Per_Afil, referenciaPersonalAfiliado => referenciaPersonalAfiliado.referenciaPersonal)
    referenciasPersonalesAfiliado: Net_Ref_Per_Afil[];

}