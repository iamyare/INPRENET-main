import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Net_Persona } from "../../afiliado/entities/Net_Persona.entity";
import { NET_TIPO_MOVIMIENTO } from "./net_tipo_movimiento.entity";

@Entity({ name: 'NET_MOVIMIENTO_CUENTA' })
export class NET_MOVIMIENTO_CUENTA {

    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_MOVIMIENTO_CUENTA', primaryKeyConstraintName: 'PK_MOVIMIENTO_CUENTA' })
    ID_MOVIMIENTO_CUENTA: number;

    @ManyToOne(() => Net_Persona, persona => persona.movimientos)
    @JoinColumn({ name: 'ID_PERSONA', foreignKeyConstraintName: "FK_ID_CUENTA_PERSONA_MOVCUENTA" })
    persona: Net_Persona;

    @ManyToOne(() => NET_TIPO_MOVIMIENTO, tipoMovimiento => tipoMovimiento.movimientos)
    @JoinColumn({ name: 'ID_TIPO_MOVIMIENTO', foreignKeyConstraintName: "FK_ID_TIPO_CUENTA_MOVCUENTA", referencedColumnName: "ID_TIPO_MOVIMIENTO" })
    @JoinColumn({ name: 'ID_TIPO_CUENTA', foreignKeyConstraintName: "FK_ID_TIPO_CUENTA_MOVCUENTA", referencedColumnName: "ID_TIPO_CUENTA" })
    tipoMovimiento: NET_TIPO_MOVIMIENTO;

    @Column()
    MONTO: number;

    @Column('date', { nullable: false, default: () => 'SYSDATE', name: 'FECHA_MOVIMIENTO' })
    FECHA_MOVIMIENTO: Date;

    @Column({ length: 30 })
    DESCRIPCION: string;

    @Column({ length: 12 })
    CREADA_POR: string;
}