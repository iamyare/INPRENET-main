import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Net_Socio } from './net_socio.entity';
import { net_persona } from 'src/modules/Persona/entities/net_persona.entity';

import { Net_Peps } from './net_peps.entity';

@Entity({ name: 'NET_CARGO_PUBLICO' })
export class Net_Cargo_Publico {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_CARGO_PUBLICO', primaryKeyConstraintName: 'PK_id_cargo_publico' })
  id_cargo_publico: number;

  @Column('varchar2', { length: 255, nullable: false, name: 'CARGO' })
  cargo: string;

  @Column('date', { nullable: false, name: 'FECHA_INICIO' })
  fecha_inicio: Date;

  @Column('date', { nullable: true, name: 'FECHA_FIN' })
  fecha_fin: Date;

  @Column('varchar2', { length: 255, nullable: true, name: 'REFERENCIAS' })
  referencias: string; 
 
  @ManyToOne(() => Net_Peps, pep => pep.cargo_publico)
  @JoinColumn({ name: 'ID_PEPS', foreignKeyConstraintName: 'FK_ID_PEPS_CARG_PUB' })
  peps: Net_Peps;
}
