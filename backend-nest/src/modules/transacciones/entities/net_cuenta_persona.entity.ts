import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Net_Tipo_Cuenta } from "./net_tipo_cuenta.entity";
import { net_persona } from "src/modules/Persona/entities/net_persona.entity";

@Entity({ name: "NET_CUENTA_PERSONA" })
export class Net_Cuenta_Persona {
    @PrimaryGeneratedColumn({ name: "ID_CUENTA_PERSONA" })
    id_cuenta_persona: number;

    @ManyToOne(() => net_persona, persona => persona.id_persona)
    @JoinColumn({ name: "ID_PERSONA", foreignKeyConstraintName: "FK_CUENTA_PERSONA" })
    persona: net_persona;

    @ManyToOne(() => Net_Tipo_Cuenta, tipoCuenta => tipoCuenta.cuentas)
    @JoinColumn({ name: "ID_TIPO_CUENTA", foreignKeyConstraintName: "FK_TIPO_CUENTA" })
    tipo_cuenta: Net_Tipo_Cuenta;

    @Column({ type: "varchar", length: 20, unique: true, name: "NUMERO_CUENTA" })
    numero_cuenta: string;
}
