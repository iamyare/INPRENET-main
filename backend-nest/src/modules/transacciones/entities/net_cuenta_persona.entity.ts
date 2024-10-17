import { net_persona } from "../../Persona/entities/net_persona.entity";
import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn} from "typeorm";
import { NET_TIPO_CUENTA } from "./net_tipo_cuenta.entity";
import { NET_MOVIMIENTO_CUENTA } from "./net_movimiento_cuenta.entity";

@Entity({ name: 'NET_CUENTA_PERSONA' })
@Check("CK1_NET_CUENTA_PERSONA", `ACTIVA_B IN ('A', 'I')`)
export class NET_CUENTA_PERSONA {
    @ManyToOne(() => net_persona, persona => persona.cuentas, { cascade: true })
    @JoinColumn({ name: 'ID_PERSONA', referencedColumnName: 'id_persona', foreignKeyConstraintName: "FK1_NET_CUENTA_PERSONA" })
    persona: net_persona;

    @ManyToOne(() => NET_TIPO_CUENTA, tipoCuenta => tipoCuenta.cuentas, { cascade: true })
    @JoinColumn({ name: 'ID_TIPO_CUENTA', referencedColumnName: 'ID_TIPO_CUENTA', foreignKeyConstraintName: "FK2_NET_CUENTA_PERSONA" })
    tipoCuenta: NET_TIPO_CUENTA;

    @PrimaryColumn({ primaryKeyConstraintName: 'PK_NET_CUENTA_PERSONA' })
    NUMERO_CUENTA: string;

    @Column({ length: 1, default: "A" })
    ACTIVA_B: string;

    @Column('date', { default: () => 'CURRENT_DATE' })
    FECHA_CREACION: Date;

    @Column({ length: 12 })
    CREADA_POR: string;

    @OneToMany(() => NET_MOVIMIENTO_CUENTA, movimientoCuenta => movimientoCuenta.cuentaPersona)
    movimientos: NET_MOVIMIENTO_CUENTA[];
}