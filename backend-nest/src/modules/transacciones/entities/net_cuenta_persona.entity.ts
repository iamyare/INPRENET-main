import { Net_Persona } from "src/modules/afiliado/entities/Net_Persona";
import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { NET_TIPO_CUENTA } from "./net_tipo_cuenta.entitiy";

@Entity({ name: 'NET_CUENTA_PERSONA' })
@Check("CK1_NET_CUENTA_PERSONA", `ACTIVA_B IN ('S', 'N')`)
export class NET_CUENTA_PERSONA {
    @ManyToOne(() => Net_Persona, persona => persona.cuentas, { cascade: true })
    @JoinColumn({ name: 'ID_PERSONA', referencedColumnName: 'id_persona', foreignKeyConstraintName: "FK1_NET_CUENTA_PERSONA" })
    persona: Net_Persona;

    @ManyToOne(() => NET_TIPO_CUENTA, tipoCuenta => tipoCuenta.cuentas, { cascade: true })
    @JoinColumn({ name: 'ID_TIPO_CUENTA', referencedColumnName: 'ID_TIPO_CUENTA', foreignKeyConstraintName: "FK2_NET_CUENTA_PERSONA" })
    tipoCuenta: NET_TIPO_CUENTA;

    @PrimaryColumn({ primaryKeyConstraintName: 'PK_NET_CUENTA_PERSONA' })
    ID_PERSONA: number;

    @PrimaryColumn({ primaryKeyConstraintName: 'PK_NET_CUENTA_PERSONA' })
    ID_TIPO_CUENTA: number;

    @PrimaryColumn({ primaryKeyConstraintName: 'PK_NET_CUENTA_PERSONA' })
    NUMERO_CUENTA: string;

    @Column({ length: 1 })
    ACTIVA_B: string;

    @Column('date',)
    FECHA_CREACION: Date;

    @Column({ length: 12 })
    CREADA_POR: string;
}
