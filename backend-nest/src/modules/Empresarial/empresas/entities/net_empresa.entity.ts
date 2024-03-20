import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'NET_EMPRESA'})
export class Net_Empresa {

    @PrimaryGeneratedColumn({type: 'int', name: 'ID_EMPRESA', primaryKeyConstraintName: 'PK_id_empresa_empresa' })
    id_empresa: number;

    @Column('varchar2', { name: 'RAZON_SOCIAL' })
    @Index("UQ_razonSoc_netEmpr", { unique:true })
    razon_social: string;
    
    @Column('varchar2', { name: 'RTN' })
    @Index("UQ_rtn_netEmpr", { unique:true })
    rtn: string;

    @Column('varchar2', { nullable: false, name: 'APODERADO_LEGAL' })
    apoderado_legal: string;

    @Column('varchar2', { nullable: false, name: 'REPRESENTANTE_LEGAL' })
    representante_legal: string;

    @Column('varchar2', { name: 'LOGO' })
    logo: string;

    @Column('varchar2', { nullable: false, name: 'DIRECCION' })
    direccion: string;

    @Column('char', { nullable: false, name: 'TELEFONO_1' })
    telefono_1: string;

    @Column('char', { name: 'TELEFONO_2' })
    telefono_2: string;

    @Column('varchar2', { nullable: false, name: 'CORREO_ELECTRONICO' })
    correo_electronico: string;
    
}

