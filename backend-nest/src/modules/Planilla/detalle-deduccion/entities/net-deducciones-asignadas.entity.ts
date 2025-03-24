import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { net_persona } from 'src/modules/Persona/entities/net_persona.entity';
import { Net_Deduccion } from '../../deduccion/entities/net_deduccion.entity';
import { Net_Detalle_Deduccion } from './detalle-deduccion.entity';

@Entity({ name: 'NET_DEDUCCIONES_ASIGNADAS' })
export class Net_Deducciones_Asignadas {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_DEDUCCION_ASIGNADA', primaryKeyConstraintName: 'PK_ID_DEDUCCION_ASIGNADA' })
  id_deduccion_asignada: number;

  @ManyToOne(() => net_persona, persona => persona.deduccionesAsignadas, { cascade: true })
  @JoinColumn({ name: 'ID_PERSONA', foreignKeyConstraintName: 'FK_ID_PERSONA_DED_ASIGNADA' })
  persona: net_persona;

  @ManyToOne(() => Net_Deduccion, deduccion => deduccion.deduccionesAsignadas, { cascade: true })
  @JoinColumn({ name: 'ID_DEDUCCION', foreignKeyConstraintName: 'FK_ID_DEDUCCION_DED_ASIGNADA' })
  deduccion: Net_Deduccion;

  @Column('date', { name: 'PERIODO_INICIO', nullable: false })
  periodo_inicio: Date;

  @Column('date', { name: 'PERIODO_FIN', nullable: true })
  periodo_fin: Date;

  @Column('varchar2', { length: 20, name: 'ESTADO', nullable: false, default: 'ACTIVA' })
  estado: string;

  @OneToMany(() => Net_Detalle_Deduccion, detalleDeduccion => detalleDeduccion.deduccionAsignada)
  detallesDeduccion: Net_Detalle_Deduccion[];
}
