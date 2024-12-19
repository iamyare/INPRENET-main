import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Net_Contratos_Conasa } from './net_contratos_conasa.entity';

@Entity({ name: 'NET_BENEFICIARIOS_CONASA' })
export class Net_Beneficiarios_Conasa {
  @PrimaryGeneratedColumn({ name: 'ID_BENEFICIARIO' })
  id_beneficiario: number;

  @ManyToOne(() => Net_Contratos_Conasa, { cascade: true })
  @JoinColumn({ name: 'ID_CONTRATO', foreignKeyConstraintName: 'FK_NET_CONTRATO_BENEFICIARIO' })
  contrato: Net_Contratos_Conasa;

  @Column({ name: 'PRIMER_NOMBRE', type: 'varchar2', length: 40 })
  primer_nombre: string;

  @Column({ name: 'SEGUNDO_NOMBRE', type: 'varchar2', length: 40, nullable: true })
  segundo_nombre: string;

  @Column({ name: 'PRIMER_APELLIDO', type: 'varchar2', length: 40, nullable: true })
  primer_apellido: string;

  @Column({ name: 'SEGUNDO_APELLIDO', type: 'varchar2', length: 40, nullable: true })
  segundo_apellido: string;

  @Column({ name: 'PARENTESCO', type: 'varchar2', length: 50, nullable: true })
  parentesco: string;

  @Column('date', { nullable: true, name: 'FECHA_NACIMIENTO' })
  fecha_nacimiento: string;
}
