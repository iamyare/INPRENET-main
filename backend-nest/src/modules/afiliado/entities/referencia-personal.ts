import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Ref_Per_Afil } from "./net_ref-Per-Afiliado";

@Entity({name: 'NET_REFERENCIA_PERSONAL'})
export class Net_ReferenciaPersonal {

    @PrimaryGeneratedColumn({type: 'int',name:'ID_REF_PERSONAL', primaryKeyConstraintName: 'PK_id_ref_per_refPer'})
     id_ref_personal: number;

    @Column('varchar2', {
        length : 50,
        nullable : false,
        name : 'NOMBRE'
    })
     nombre : string;

    @Column('varchar2', {
        length : 200,
        nullable : false,
        name : 'DIRECCION'
    })
     direccion: string;

    @Column('varchar2', {
        length : 30,
        nullable : false,
        name : 'PARENTESCO'
    })
     parentesco: string;

    @Column('varchar2', {
        length : 40,
        nullable : true,
        name :'TELEFONO_DOMICILIO'
    })
     telefono_domicilio: string;

    @Column('varchar2', {
        length : 12,
        nullable : false,
        name: 'TELEFONO_TRABAJO'
    })
     telefono_trabajo: string;

    @Column('varchar2', {
        length : 12,
        nullable : false,
        name: 'TELEFONO_CELULAR'
    })
     telefono_celular: string;

    @OneToMany(() => Net_Ref_Per_Afil, referenciaPersonalAfiliado => referenciaPersonalAfiliado.referenciaPersonal)
    referenciasPersonalesAfiliado: Net_Ref_Per_Afil[];

}