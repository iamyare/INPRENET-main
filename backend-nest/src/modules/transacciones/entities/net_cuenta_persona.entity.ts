import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn} from "typeorm";
import { NET_TIPO_CUENTA } from "./net_tipo_cuenta.entity";
import { NET_MOVIMIENTO_CUENTA } from "./net_movimiento_cuenta.entity";
import { Net_perf_pers_cent_trab } from "src/modules/Persona/entities/net_perf_pers_cent_trab.entity";

@Entity({ name: 'NET_CUENTA_PERSONA' })
@Check("CK1_NET_CUENTA_PERSONA", `ACTIVA_B IN ('A', 'I')`)
export class NET_CUENTA_PERSONA {
    @PrimaryColumn({ primaryKeyConstraintName: 'PK_NET_CUENTA_PERSONA' })
    ID_CUENTA_PERSONA: number;

    @ManyToOne(() => NET_TIPO_CUENTA, tipoCuenta => tipoCuenta.cuentas, { cascade: true })
    @JoinColumn({ name: 'ID_TIPO_CUENTA', referencedColumnName: 'ID_TIPO_CUENTA', foreignKeyConstraintName: "FK2_NET_CUENTA_PERSONA" })
    tipoCuenta: NET_TIPO_CUENTA;

    @ManyToOne(() => Net_perf_pers_cent_trab, perfPersCentTrab => perfPersCentTrab.cuentasPersona)
    @JoinColumn({ name: 'ID_PERF_PERS_CENTR_TRAB', referencedColumnName: 'id_perf_pers_centro_trab', foreignKeyConstraintName: "FK3_NET_CUENTA_PERSONA" })
    perfPersCentTrab: Net_perf_pers_cent_trab;

    @Column({ length: 1, default: "A" })
    ACTIVA_B: string;

    @Column('date', { default: () => 'CURRENT_DATE' })
    FECHA_CREACION: Date;

    @Column({ length: 12 })
    CREADA_POR: string;

    @Column('nvarchar2', { length: 50, nullable: false, name: 'NUMERO_CUENTA' })
    NUMERO_CUENTA: string;

    @OneToMany(() => NET_MOVIMIENTO_CUENTA, movimientoCuenta => movimientoCuenta.cuentaPersona)
    movimientos: NET_MOVIMIENTO_CUENTA[];
}