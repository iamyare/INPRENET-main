import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Net_Sociedad_Socio } from './net_sociedad_socio.entity';
import { Net_Sociedad_Centro_Trabajo } from './net_sociedad_centro.entity';

@Entity({ name: 'NET_SOCIEDAD' })
export class Net_Sociedad {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_SOCIEDAD', primaryKeyConstraintName: 'PK_id_sociedad' })
  id_sociedad: number;

  @Column('varchar2', { length: 255, nullable: false, name: 'NOMBRE' })
  nombre: string;

  @Column('varchar2', { length: 50, nullable: true, name: 'RTN' })
  rtn: string;

  @Column('varchar2', { length: 50, nullable: true, name: 'TELEFONO' })
  telefono: string;

  @Column('varchar2', { length: 50, nullable: true, name: 'CORREO_ELECTRONICO' })
  correo_electronico: string;

  @OneToMany(() => Net_Sociedad_Socio, sociedadSocio => sociedadSocio.sociedad)
  sociedadSocios: Net_Sociedad_Socio[];

  @OneToMany(() => Net_Sociedad_Centro_Trabajo, sociedadCentroTrabajo => sociedadCentroTrabajo.sociedad)
  sociedadCentroTrabajos: Net_Sociedad_Centro_Trabajo[];
}
