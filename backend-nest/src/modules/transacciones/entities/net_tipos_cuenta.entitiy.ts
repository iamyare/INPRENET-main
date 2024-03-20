import { Check, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { NET_CUENTAS_PERSONA } from "./net_cuentas_persona.entity";
import { NET_MOVIMIENTO_CUENTA } from "./net_movimiento_cuenta.entity";
import { NET_TIPO_MOVIMIENTO_CUENTA } from "./net_tipo_movimiento_cuenta.entity";

@Entity({name:'NET_TIPO_CUENTA'})
@Check("CK1_APORTACION_B_NET_TIPO_CUENTA",`APORTACION_B IN ('S', 'N')`)
@Check("CK2_COTIZACION_B_NET_TIPO_CUENTA",`COTIZACION_B IN ('S', 'N')`)
@Check("CK3_CAP_B_NET_TIPO_CUENTA",`CAP_B IN ('S', 'N')`)
export class NET_TIPOS_CUENTA {

    @PrimaryGeneratedColumn({type: 'int',name: 'ID_TIPO_CUENTA', primaryKeyConstraintName: 'PK_NET_TIPO_CUENTA'})
    ID_TIPO_CUENTA : number;

    @Column({length:59})
    DESCRIPCION : string;

    @Column({length:1})
    APORTACION_B : string;

    @Column({length:1})
    COTIZACION_B : string;

    @Column({length:1})
    CAP_B : string;

    @OneToMany(() => NET_CUENTAS_PERSONA, cuentaPersona => cuentaPersona.tipoCuentaa)
    cuentas: NET_CUENTAS_PERSONA[];
    
    @OneToMany(() => NET_TIPO_MOVIMIENTO_CUENTA, cuentaPersona => cuentaPersona.tipoCuenta)
    movCuenta: NET_TIPO_MOVIMIENTO_CUENTA[];


}