import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { NET_MOVIMIENTO_CUENTA } from "./net_movimiento_cuenta.entity";

@Entity({ name: 'NET_TIPO_MOVIMIENTO' })
export class NET_TIPO_MOVIMIENTO {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_TIPO_MOVIMIENTO' })
    ID_TIPO_MOVIMIENTO: number;

    @Column()
    ACTIVA_B: string;

    @Column({ length: 1 })
    DEBITO_CREDITO_B: string;

    @Column({ length: 30 })
    DESCRIPCION: string;

    @Column({ length: 5 })
    DESCRIPCION_CORTA: string;

    @Column({ length: 15 })
    CUENTA_CONTABLE: string;

    @Column({ length: 12 })
    CREADA_POR: string;

    @OneToMany(() => NET_MOVIMIENTO_CUENTA, movimientoCuenta => movimientoCuenta.tipoMovimiento)
    movimientos: NET_MOVIMIENTO_CUENTA[];
}
