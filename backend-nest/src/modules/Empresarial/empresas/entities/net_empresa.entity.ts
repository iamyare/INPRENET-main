import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Empleado_Empresa } from "./net_empleado-empresa.entity";

@Entity()
export class Net_Empresa {

    @PrimaryGeneratedColumn('uuid')
    id_empresa : string;
    
    @OneToMany(
        () => Net_Empleado_Empresa,
        (empleadoEmpresa) => empleadoEmpresa.id_empresa,
        { cascade: true}
    )

    @Column('varchar2')
    @Index("UQ_razonSoc_netEmpr", {unique:true})
    razon_social : string;
    
    @Column('varchar2')
    @Index("UQ_rtn_netEmpr", {unique:true})
    rtn : string;

    @Column('varchar2', {
        nullable : false
    })
    apoderado_legal : string

    @Column('varchar2', {
        nullable : false
    })
    representante_legal : string

    @Column('varchar2')
    logo : string

    @Column('varchar2', {
        nullable : false
    })
    direccion : string

    @Column('char', {
        nullable : false,
    })
    telefono_1 : string

    @Column('char')
    telefono_2 : string

    @Column('varchar2', {
        nullable : false
    })
    correo_electronico
    
}

