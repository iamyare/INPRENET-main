import { Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Net_Centro_Trabajo } from './net_centro_trabajo.entity';
import { Net_Nivel_Educativo } from 'src/modules/Empresarial/entities/net_nivel_educativo.entity';

@Entity({ name: 'NET_CENTRO_TRABAJO_NIVEL' })
export class Net_Centro_Trabajo_Nivel {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_CENTRO_TRABAJO_NIVEL', primaryKeyConstraintName: 'PK_id_centro_trabajo_nivel' })
  id_centro_trabajo_nivel: number;

  @ManyToOne(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.centroTrabajoNiveles)
  @JoinColumn({ name: 'ID_CENTRO_TRABAJO', foreignKeyConstraintName: 'FK_id_centro_trabajo_nivel' })
  centroTrabajo: Net_Centro_Trabajo;

  @ManyToOne(() => Net_Nivel_Educativo, nivel => nivel.centroTrabajoNiveles)
  @JoinColumn({ name: 'ID_NIVEL', foreignKeyConstraintName: 'FK_id_nivel_centro_trabajo' })
  nivel: Net_Nivel_Educativo;

}
