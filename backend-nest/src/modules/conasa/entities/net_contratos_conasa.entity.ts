import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Net_Plan } from './net_planes.entity';
import { Net_Beneficiarios_Conasa } from './net_beneficiarios_conasa.entity';
import { net_persona } from 'src/modules/Persona/entities/net_persona.entity';

@Entity({ name: 'NET_CONTRATOS_CONASA' })
export class Net_Contratos_Conasa {
  @PrimaryGeneratedColumn({ name: 'ID_CONTRATO' })
  id_contrato: number;

  @ManyToOne(() => net_persona, { cascade: true })
  @JoinColumn({ name: 'ID_TITULAR', foreignKeyConstraintName: 'FK_NET_TITULAR_CONTRATO' })
  titular: net_persona;

  @ManyToOne(() => Net_Plan, { cascade: true })
  @JoinColumn({ name: 'ID_PLAN', foreignKeyConstraintName: 'FK_NET_PLAN_CONTRATO' })
  plan: Net_Plan;

  @Column({ name: 'NUMERO_PRODUCTO', type: 'varchar2', length: 50, unique: true, nullable: true })
  numero_producto: string;

  @Column('date', { name: 'FECHA_INICIO_CONTRATO', nullable: true })
  fecha_inicio_contrato: Date;

  @Column('date', { name: 'FECHA_CANCELACION_CONTRATO', nullable: true })
  fecha_cancelacion_contrato: Date;

  @Column({ name: 'LUGAR_COBRO', type: 'varchar2', length: 100 })
  lugar_cobro: string;

  @Column({ name: 'STATUS', type: 'varchar2', length: 10, default: 'ACTIVO' })
  status: string;

  @Column({ name: 'DIRECCION_TRABAJO', type: 'varchar2', length: 200, nullable: true })
  direccion_trabajo: string;

  @Column({ name: 'EMPRESA', type: 'varchar2', length: 100, nullable: true })
  empresa: string;

  @Column({ name: 'OBSERVACION', type: 'varchar2', length: 500, nullable: true })
  observacion: string;

  @OneToMany(() => Net_Beneficiarios_Conasa, (beneficiario) => beneficiario.contrato)
  beneficiarios: Net_Beneficiarios_Conasa[];
}