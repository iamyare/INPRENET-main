import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Check } from "typeorm";
import { NET_CUENTA_PERSONA } from "./net_cuenta_persona.entity";

@Entity({ name: 'NET_TIPO_CUENTA' })
@Check("CK1_APORTACION_B_NET_TIPO_CUENTA", `APORTACION_B IN ('S', 'N')`)
@Check("CK2_COTIZACION_B_NET_TIPO_CUENTA", `COTIZACION_B IN ('S', 'N')`)
@Check("CK3_CAP_B_NET_TIPO_CUENTA", `CAP_B IN ('S', 'N')`)
export class NET_TIPO_CUENTA {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_TIPO_CUENTA' })
    ID_TIPO_CUENTA: number;

    @Column({ length: 59 })
    DESCRIPCION: string;

    @Column({ length: 1 })
    APORTACION_B: string;

    @Column({ length: 1 })
    COTIZACION_B: string;

    @Column({ length: 1 })
    CAP_B: string;

    @OneToMany(() => NET_CUENTA_PERSONA, cuentaPersona => cuentaPersona.tipoCuenta)
    cuentas: NET_CUENTA_PERSONA[];
}
