import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Net_Plan } from './net_planes.entity';
import { net_persona } from 'src/modules/Persona/entities/net_persona.entity';

@Entity({ name: 'NET_BENEFICIARIOS_CONASA' })
export class Net_Beneficiario_Conasa {
  @PrimaryGeneratedColumn({ name: 'ID_BENEFICIARIO' })
  id_beneficiario: number;

  @Column({ name: 'FECHA_INICIO_CONTRATO', type: 'date' })
  fecha_inicio_contrato: Date;

  @Column({ name: 'FECHA_FIN_CONTRATO', type: 'date', nullable: true })
  fecha_fin_contrato: Date; 

  @Column({ name: 'PARENTESCO', type: 'varchar2', length: 50 })
  parentesco: string;

  @Column({ name: 'OBSERVACIONES', type: 'varchar2', length: 500, nullable: true })
  observaciones: string; 

  @Column({ name: 'LUGAR_COBRO', type: 'varchar2', length: 100 })
  lugar_cobro: string;

  @ManyToOne(() => net_persona, (persona) => persona.id_persona, { cascade: true })
  @JoinColumn({ name: 'ID_TITULAR', foreignKeyConstraintName: 'FK_NET_TITULAR_CONASA' })
  titular: net_persona;

  @ManyToOne(() => net_persona, (persona) => persona.id_persona, { cascade: true })
  @JoinColumn({ name: 'ID_BENEFICIARIO_PERSONA', foreignKeyConstraintName: 'FK_NET_BENEFICIARIO_CONASA' })
  beneficiario: net_persona; 

  @ManyToOne(() => Net_Plan, (plan) => plan.id_plan, { cascade: true })
  @JoinColumn({ name: 'ID_PLAN', foreignKeyConstraintName: 'FK_NET_PLAN_CONASA' })
  plan: Net_Plan;
}
