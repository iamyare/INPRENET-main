import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Net_Socio } from './net_socio.entity';
import { net_persona } from 'src/modules/Persona/entities/net_persona.entity';

import { Net_Cargo_Publico } from 'src/modules/Empresarial/entities/net_cargo_publico.entity';

@Entity({ name: 'NET_PEPS' })
export class Net_Peps {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_PEPS', primaryKeyConstraintName: 'PK_id_peps' })
  id_peps: number;

  @Column('varchar2', { nullable: false, name: 'ESTADO', default: 'HABILITADO' })
  estado: Date;

  @ManyToOne(() => net_persona, persona => persona.peps)
  @JoinColumn({ name: 'ID_PERSONA', foreignKeyConstraintName: 'FK_id_persona_peps' })
  persona: net_persona;

  @ManyToOne(() => Net_Socio, socio => socio.peps)
  @JoinColumn({ name: 'ID_SOCIO', foreignKeyConstraintName: 'FK_id_socio_peps' })
  socio: Net_Socio;

  @OneToMany(() => Net_Cargo_Publico, cargo_publico => cargo_publico.peps)
  cargo_publico: Net_Cargo_Publico[];
}
