import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Check } from 'typeorm';
import { Net_Centro_Trabajo } from './net_centro_trabajo.entity';

@Entity({ name: 'NET_REFERENCIA_CENTRO_TRABAJO' })
@Check(`TIPO_REFERENCIA IN ('BANCARIA', 'COMERCIAL')`)
export class Net_Referencia_Centro_Trabajo {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_REFERENCIA', primaryKeyConstraintName: 'PK_id_referencia_centro_trabajo' })
  id_referencia: number;

  @Column('varchar2', { length: 50, nullable: false, name: 'TIPO_REFERENCIA' })
  tipoReferencia: string;

  @Column('varchar2', { length: 255, nullable: false, name: 'NOMBRE' })
  nombre: string;

  @ManyToOne(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.referencias)
  @JoinColumn({ name: 'ID_CENTRO_TRABAJO', referencedColumnName: 'id_centro_trabajo', foreignKeyConstraintName: 'FK_id_centro_trabajo_referencia' })
  centroTrabajo: Net_Centro_Trabajo;
}
