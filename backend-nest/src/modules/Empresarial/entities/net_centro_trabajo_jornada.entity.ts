import { Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Net_Centro_Trabajo } from './net_centro_trabajo.entity';
import { Net_Jornada } from './net_jornada.entity';

@Entity({ name: 'NET_CENTRO_TRABAJO_JORNADA' })
export class Net_Centro_Trabajo_Jornada {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_CENTRO_TRABAJO_JORNADA', primaryKeyConstraintName: 'PK_id_centro_trabajo_jornada' })
  id_centro_trabajo_jornada: number;

  @ManyToOne(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.centroTrabajoJornadas)
  @JoinColumn({ name: 'ID_CENTRO_TRABAJO', foreignKeyConstraintName: 'FK_id_centro_trabajo_jornada' })
  centroTrabajo: Net_Centro_Trabajo;

  @ManyToOne(() => Net_Jornada, jornada => jornada.centroTrabajoJornadas)
  @JoinColumn({ name: 'ID_JORNADA', foreignKeyConstraintName: 'FK_id_jornada_centro_trabajo' })
  jornada: Net_Jornada;
}
