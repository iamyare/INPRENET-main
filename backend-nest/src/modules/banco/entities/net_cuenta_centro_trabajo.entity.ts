import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, Check } from 'typeorm';
import { Net_Banco } from './net_banco.entity';
import { Net_Centro_Trabajo } from 'src/modules/Empresarial/entities/net_centro_trabajo.entity';

@Entity({ name: 'NET_CUENTA_CENTRO_TRABAJO' })
@Check('CHK_ESTADO', `"ESTADO" IN ('ACTIVA', 'INACTIVA')`)
export class Net_Cuenta_Centro_Trabajo {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_CUENTA_CENTRO_TRABAJO', primaryKeyConstraintName: 'PK_id_cuenta_centro_trabajo' })
    id_cuenta_centro_trabajo: number;

    @Column('varchar2', { length: 40, nullable: false, name: 'NUM_CUENTA' })
    @Index("UQ_num_cuenta_net_cuenta_centro_trabajo", { unique: true })
    num_cuenta: string;

    @Column('varchar2', { length: 20, nullable: false, name: 'ESTADO' })
    estado: string;

    @ManyToOne(() => Net_Banco, banco => banco.personasDeBanco, { nullable: false })
    @JoinColumn({ name: 'ID_BANCO', foreignKeyConstraintName: 'FK_ID_BANCO_CUENTA_CENTRO_TRAB' })
    banco: Net_Banco;

    @ManyToOne(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.modulos, { nullable: false })
    @JoinColumn({ name: 'ID_CENTRO_TRABAJO', foreignKeyConstraintName: 'FK_ID_CENTRO_TRAB_CUENTA_CENTRO_TRAB' })
    centroTrabajo: Net_Centro_Trabajo;
}
