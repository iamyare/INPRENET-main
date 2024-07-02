import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Net_Socio } from './net_socio.entity';
import { net_persona } from 'src/modules/Persona/entities/net_persona.entity';

@Entity({ name: 'NET_PEPS' })
export class Net_Peps {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_PEPS', primaryKeyConstraintName: 'PK_id_peps' })
  id_peps: number;

  @Column('varchar2', { length: 255, nullable: false, name: 'CARGO' })
  cargo: string;

  @Column('date', { nullable: false, name: 'FECHA_INICIO' })
  fecha_inicio: Date;

  @Column('date', { nullable: true, name: 'FECHA_FIN' })
  fecha_fin: Date;

  @Column('varchar2', { length: 255, nullable: true, name: 'REFERENCIAS' })
  referencias: string;

  @ManyToOne(() => Net_Socio, socio => socio.peps)
  @JoinColumn({ name: 'ID_SOCIO', foreignKeyConstraintName: 'FK_id_socio_peps' })
  socio: Net_Socio;

  @ManyToOne(() => net_persona, persona => persona.peps)
  @JoinColumn({ name: 'ID_PERSONA', foreignKeyConstraintName: 'FK_id_persona_peps' })
  persona: net_persona;
}
