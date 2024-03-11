import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { NET_MOVIMIENTO_CUENTA } from './net_movimiento_cuenta.entity';

@Entity({name:'NET_TIPO_MOVIMIENTO_CUENTA'})
export class NET_TIPO_MOVIMIENTO_CUENTA {

    @PrimaryGeneratedColumn({type: 'int',name: 'ID_TIPO_MOVIMIENTO', primaryKeyConstraintName: 'PK_tipo_movimiento'})
    ID_TIPO_MOVIMIENTO : number;

    @Column({length:100})
    DESCRIPCION:string;

    @Column({length:1})
    DEBITO_CREDITO_B:string;

    @OneToMany(() => NET_MOVIMIENTO_CUENTA, movimientoCuenta => movimientoCuenta.tipoMovimiento)
    movimientos: NET_MOVIMIENTO_CUENTA[];
    
}