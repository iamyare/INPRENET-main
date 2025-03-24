import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Check } from "typeorm";
import { Net_Cuenta_Persona } from "./net_cuenta_persona.entity";

@Entity({ name: "NET_TIPO_CUENTA" })
@Check("CHK_TIPO_CUENTA", "NOMBRE_TIPO IN ('APORTACION', 'COTIZACION', 'CAP')")
export class Net_Tipo_Cuenta {
    @PrimaryGeneratedColumn({ name: "ID_TIPO_CUENTA" })
    id_tipo_cuenta: number;

    @Column({ type: "varchar", length: 50, name: "NOMBRE_TIPO", unique: true })
    nombre_tipo: string;

    @OneToMany(() => Net_Cuenta_Persona, cuenta => cuenta.tipo_cuenta)
    cuentas: Net_Cuenta_Persona[];
}
