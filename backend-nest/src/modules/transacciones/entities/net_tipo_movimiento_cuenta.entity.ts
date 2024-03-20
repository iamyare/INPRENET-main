import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { NET_MOVIMIENTO_CUENTA } from './net_movimiento_cuenta.entity';
import { NET_TIPOS_CUENTA } from './net_tipos_cuenta.entitiy';

@Entity({name:'NET_TIPO_MOVIMIENTO'})
@Check("CK_ACTIVA_NET_TIPO_MOV",`ACTIVA_B IN ('S', 'N')`)
@Check("CK_DEB_CRED_NET_TIPO_MOV",`DEBITO_CREDITO_B IN ('D', 'C')`)
export class NET_TIPO_MOVIMIENTO_CUENTA {

    @PrimaryGeneratedColumn({type: 'int',name: 'ID_TIPO_MOVIMIENTO', primaryKeyConstraintName: 'PK_TIPO_MOVIMIENTO'})
    ID_TIPO_MOVIMIENTO : number;

    @PrimaryColumn({name: 'ID_TIPO_CUENTA', primaryKeyConstraintName: 'PK_TIPO_MOVIMIENTO'})
    ID_TIPO_CUENTA : number;

    @Column()
    ACTIVA_B:number;

    @Column({length:1})
    DEBITO_CREDITO_B:string;
    
    @Column({length:30})
    DESCRIPCION:string;

    @Column({length:5})
    DESCRIPCION_CORTA:string;

    @Column({length:15})
    CUENTA_CONTABLE:string;

    @Column({length:12})
    CREADA_POR:string;

    @OneToMany(() => NET_MOVIMIENTO_CUENTA, movimientoCuenta => movimientoCuenta.tipoMovimiento)
    movimientos: NET_MOVIMIENTO_CUENTA[];
    
    @ManyToOne(() => NET_TIPOS_CUENTA, tipoCuenta => tipoCuenta.movCuenta)
    @JoinColumn({ name: 'ID_TIPO_CUENTA', foreignKeyConstraintName:"FK_ID_TIPO_TIPO_MOVIMIENTO"})
    tipoCuenta: NET_TIPOS_CUENTA;
    
    
}