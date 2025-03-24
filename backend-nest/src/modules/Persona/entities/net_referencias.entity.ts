import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { net_persona } from './net_persona.entity';

@Entity({ name: 'NET_REFERENCIAS' })
export class Net_Referencias {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_REFERENCIA', primaryKeyConstraintName: 'PK_ID_REFERENCIA' })
  id_referencia: number;

  @Column('varchar2', { length: 50, nullable: false, name: 'TIPO_REFERENCIA' })
  tipo_referencia: string;

  @Column('varchar2', { length: 40, nullable: false, name: 'PRIMER_NOMBRE' })
  primer_nombre: string;

  @Column('varchar2', { length: 40, nullable: true, name: 'SEGUNDO_NOMBRE' })
  segundo_nombre: string;

  @Column('varchar2', { length: 40, nullable: true, name: 'TERCER_NOMBRE' })
  tercer_nombre: string;

  @Column('varchar2', { length: 40, nullable: false, name: 'PRIMER_APELLIDO' })
  primer_apellido: string;

  @Column('varchar2', { length: 40, nullable: true, name: 'SEGUNDO_APELLIDO' })
  segundo_apellido: string;

  @Column('varchar2', { length: 30, nullable: false, name: 'PARENTESCO' })
  parentesco: string;

  @Column('varchar2', { length: 500, nullable: true, name: 'DIRECCION' })
  direccion: string;

  @Column('varchar2', { length: 12, nullable: true, name: 'TELEFONO_DOMICILIO' })
  telefono_domicilio: string;

  @Column('varchar2', { length: 12, nullable: true, name: 'TELEFONO_TRABAJO' })
  telefono_trabajo: string;

  @Column('varchar2', { length: 12, nullable: true, name: 'TELEFONO_PERSONAL' })
  telefono_personal: string;

  @Column('varchar2', { length: 20, nullable: true, name: 'N_IDENTIFICACION' })
  n_identificacion: string;

  @Column('varchar2', { length: 10, nullable: false, default: 'ACTIVO', name: 'ESTADO' })
  estado: string;

  @ManyToOne(() => net_persona, persona => persona.referencias)
  @JoinColumn({ name: 'ID_PERSONA', foreignKeyConstraintName: 'FK_ID_PERSONA_NET_REFERENCIAS' })
  persona: net_persona;
}
