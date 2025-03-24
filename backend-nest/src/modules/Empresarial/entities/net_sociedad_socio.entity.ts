import { Entity, ManyToOne, JoinColumn, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Net_Socio } from './net_socio.entity';
import { Net_Sociedad } from './net.sociedad.entity';

@Entity({ name: 'NET_SOCIEDAD_SOCIO' })
export class Net_Sociedad_Socio {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_SOCIEDAD_SOCIO', primaryKeyConstraintName: 'PK_id_sociedad_socio' })
  id_sociedad_socio: number;

  @ManyToOne(() => Net_Sociedad, sociedad => sociedad.sociedadSocios)
  @JoinColumn({ name: 'ID_SOCIEDAD', referencedColumnName: 'id_sociedad', foreignKeyConstraintName: 'FK_id_sociedad_sociedad_socio' })
  sociedad: Net_Sociedad;

  @ManyToOne(() => Net_Socio, socio => socio.sociedadSocios)
  @JoinColumn({ name: 'ID_SOCIO', referencedColumnName: 'id_socio', foreignKeyConstraintName: 'FK_id_socio_sociedad_socio' })
  socio: Net_Socio;

  @Column('decimal', { precision: 5, scale: 2, nullable: false, name: 'PORCENTAJE_PARTICIPACION' })
  porcentajeParticipacion: number;

  @Column('date', { nullable: false, name: 'FECHA_INGRESO' })
  fechaIngreso: Date;

  @Column('date', { nullable: true, name: 'FECHA_SALIDA' })
  fechaSalida: Date;
}
