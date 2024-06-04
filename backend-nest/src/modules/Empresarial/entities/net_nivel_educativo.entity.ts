import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Net_Centro_Trabajo_Nivel } from './net_centro_trabajo_nivel.entity';

@Entity({ name: 'NET_NIVEL_EDUCATIVO' })
export class Net_Nivel_Educativo {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_NIVEL', primaryKeyConstraintName: 'PK_id_nivel' })
  id_nivel: number;

  @Column('varchar2', { length: 50, nullable: false, unique: true, name: 'NOMBRE_NIVEL' })
  nombre: string;

  @OneToMany(() => Net_Centro_Trabajo_Nivel, centroTrabajoNivel => centroTrabajoNivel.nivel)
  centroTrabajoNiveles: Net_Centro_Trabajo_Nivel[];
}
