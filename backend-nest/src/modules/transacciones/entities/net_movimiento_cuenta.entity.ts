import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { NET_TIPO_MOVIMIENTO } from "./net_tipo_movimiento.entity";
import { NET_CUENTA_PERSONA } from "./net_cuenta_persona.entity";

@Entity({ name: 'NET_MOVIMIENTO_CUENTA' })
export class NET_MOVIMIENTO_CUENTA {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_MOVIMIENTO_CUENTA' })
    ID_MOVIMIENTO_CUENTA: number;

    @ManyToOne(() => NET_TIPO_MOVIMIENTO, tipoMovimiento => tipoMovimiento.movimientos)
    @JoinColumn({ name: 'ID_TIPO_MOVIMIENTO', referencedColumnName: 'ID_TIPO_MOVIMIENTO' })
    tipoMovimiento: NET_TIPO_MOVIMIENTO;

    @ManyToOne(() => NET_CUENTA_PERSONA, cuentaPersona => cuentaPersona.movimientos)
    @JoinColumn({ name: 'NUMERO_CUENTA', referencedColumnName: 'NUMERO_CUENTA' })  // Asumiendo que 'NUMERO_CUENTA' es la PK o un identificador único en NET_CUENTA_PERSONA
    cuentaPersona: NET_CUENTA_PERSONA;

    @Column()
    MONTO: number;

    @Column('date', { nullable: false, default: () => 'SYSDATE', name: 'FECHA_MOVIMIENTO' })
    FECHA_MOVIMIENTO: Date;

    @Column({ length: 30 })
    DESCRIPCION: string;

    @Column({ length: 12 })
    CREADA_POR: string;
}
