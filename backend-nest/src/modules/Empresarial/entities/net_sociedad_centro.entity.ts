import { Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Net_Centro_Trabajo } from './net_centro_trabajo.entity';
import { Net_Sociedad } from './net.sociedad.entity';

@Entity({ name: 'NET_SOCIEDAD_CENTRO_TRABAJO' })
export class Net_Sociedad_Centro_Trabajo {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_SOCIEDAD_CENTRO_TRABAJO', primaryKeyConstraintName: 'PK_id_sociedad_centro_trabajo' })
  id_sociedad_centro_trabajo: number;

  @ManyToOne(() => Net_Sociedad, sociedad => sociedad.sociedadCentroTrabajos)
  @JoinColumn({ name: 'ID_SOCIEDAD', referencedColumnName: 'id_sociedad', foreignKeyConstraintName: 'FK_id_sociedad_centro_trabajo' })
  sociedad: Net_Sociedad;

  @ManyToOne(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.sociedadCentroTrabajos)
  @JoinColumn({ name: 'ID_CENTRO_TRABAJO', referencedColumnName: 'id_centro_trabajo', foreignKeyConstraintName: 'FK_id_centro_trabajo_sociedad' })
  centroTrabajo: Net_Centro_Trabajo;
}
