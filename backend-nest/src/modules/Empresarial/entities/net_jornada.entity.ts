import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Net_Centro_Trabajo_Jornada } from './net_centro_trabajo_jornada.entity';

@Entity({ name: 'NET_JORNADA' })
export class Net_Jornada {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_JORNADA', primaryKeyConstraintName: 'PK_id_jornada' })
  id_jornada: number;

  @Column('varchar2', { length: 50, nullable: false, unique: true, name: 'NOMBRE_JORNADA' })
  nombre: string;

  @OneToMany(() => Net_Centro_Trabajo_Jornada, centroTrabajoJornada => centroTrabajoJornada.jornada)
  centroTrabajoJornadas: Net_Centro_Trabajo_Jornada[];
}
