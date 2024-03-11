import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { NET_CUENTAS_PERSONA } from "./net_cuentas_persona.entity";

@Entity({name:'NET_TIPOS_CUENTA'})
export class NET_TIPOS_CUENTA {

    @PrimaryGeneratedColumn({type: 'int',name: 'ID_TIPO_CUENTA', primaryKeyConstraintName: 'PK_tipo_cuenta'})
    ID_TIPO_CUENTA : number;

    @Column({length:100})
    DESCRIPCION : string;

    @OneToMany(() => NET_CUENTAS_PERSONA, cuentaPersona => cuentaPersona.tipoCuenta)
    cuentas: NET_CUENTAS_PERSONA[];
}