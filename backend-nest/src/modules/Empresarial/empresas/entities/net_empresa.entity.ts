import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Net_Empresa {

    @PrimaryGeneratedColumn('uuid')
    ID_EMPRESA : string;

    @Column('varchar2')
    @Index("UQ_razonSoc_netEmpr", {unique:true})
    RAZON_SOCIAL : string;
    
    @Column('varchar2')
    @Index("UQ_rtn_netEmpr", {unique:true})
    RTN : string;

    @Column('varchar2', {
        nullable : false
    })
    APODERADO_LEGAL : string

    @Column('varchar2', {
        nullable : false
    })
    REPRESENTANTE_LEGAL : string

    @Column('varchar2')
    LOGO : string

    @Column('varchar2', {
        nullable : false
    })
    DIRECCION : string

    @Column('char', {
        nullable : false,
    })
    TELEFONO_1 : string

    @Column('char')
    TELEFONO_2 : string

    @Column('varchar2', {
        nullable : false
    })
    CORREO_ELECTRONICO: string;
    
}

