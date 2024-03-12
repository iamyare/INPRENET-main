import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { NET_TIPO_MOVIMIENTO_CUENTA } from "./net_tipo_movimiento_cuenta.entity";
import { NET_CUENTAS_PERSONA } from "./net_cuentas_persona.entity";
import { Net_Usuario } from "src/modules/usuario/entities/net_usuario.entity";

@Entity({name:'NET_MOVIMIENTO_CUENTA'})
export class NET_MOVIMIENTO_CUENTA {

    @PrimaryGeneratedColumn({type: 'int',name: 'ID_MOVIMIENTO_CUENTA', primaryKeyConstraintName: 'PK_movimiento_cuenta'})
    ID_MOVIMIENTO_CUENTA : number;

    @ManyToOne(() => NET_CUENTAS_PERSONA, cuentaPersona => cuentaPersona.movimientos)
    @JoinColumn({ name: 'ID_CUENTA_PERSONA', foreignKeyConstraintName:"FK_ID_CUENTA_PERSONA_MOVCUENTA" })
    cuentaPersona: NET_CUENTAS_PERSONA;

    @ManyToOne(() => NET_TIPO_MOVIMIENTO_CUENTA, tipoMovimiento => tipoMovimiento.movimientos)
    @JoinColumn({ name: 'ID_TIPO_MOVIMIENTO', foreignKeyConstraintName:"FK_ID_TIPO_MOVIMIENTO_MOVCUENTA"})
    tipoMovimiento: NET_TIPO_MOVIMIENTO_CUENTA;

    @ManyToOne(() => Net_Usuario, usuario => usuario.movimientosCuenta)
    @JoinColumn({ name: 'ID_USUARIO', foreignKeyConstraintName:"FK_ID_USUARIO_MOVCUENTA"})
    usuario: Net_Usuario;

    @Column()
    MONTO: number;

    @Column('date', { nullable: false, default: () => 'SYSDATE', name: 'FECHA_MOVIMIENTO' })
    FECHA_MOVIMIENTO:Date;

    @Column()
    ANIO:number;

    @Column()
    MES:number;
}