import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { NET_TIPO_MOVIMIENTO } from "./net_tipo_movimiento.entity";
import { NET_CUENTA_PERSONA } from "./net_cuenta_persona.entity";

@Entity({ name: 'NET_MOVIMIENTO_CUENTA' })
export class NET_MOVIMIENTO_CUENTA {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_MOVIMIENTO_CUENTA', primaryKeyConstraintName: 'PK_ID_MOVIM_CUENTA_NET_MOV_CUE' })
    ID_MOVIMIENTO_CUENTA: number;

    @Column()
    MONTO: number;

    @Column('date', { nullable: false, default: () => 'SYSDATE', name: 'FECHA_MOVIMIENTO' })
    FECHA_MOVIMIENTO: Date;

    @Column({ length: 30 })
    DESCRIPCION: string;

    @Column({ length: 12 })
    CREADA_POR: string;
    
    @ManyToOne(() => NET_TIPO_MOVIMIENTO, tipoMovimiento => tipoMovimiento.movimientos)
    @JoinColumn({ name: 'ID_TIPO_MOVIMIENTO', referencedColumnName: 'ID_TIPO_MOVIMIENTO', foreignKeyConstraintName: 'FK_ID_TIPO_MOV_NET_MOV_CUEN' })
    tipoMovimiento: NET_TIPO_MOVIMIENTO;

    @ManyToOne(() => NET_CUENTA_PERSONA, cuentaPersona => cuentaPersona.movimientos)
    @JoinColumn({ name: 'NUMERO_CUENTA', referencedColumnName: 'NUMERO_CUENTA', foreignKeyConstraintName: 'FK_NUM_CUENTA_NET_MOV_CUEN' })  // Asumiendo que 'NUMERO_CUENTA' es la PK o un identificador único en NET_CUENTA_PERSONA
    cuentaPersona: NET_CUENTA_PERSONA;

    @Column({ precision: 4, scale: 0  })
    ANO: number;

    @Column({ precision: 2, scale: 0  })
    MES: number;
}
