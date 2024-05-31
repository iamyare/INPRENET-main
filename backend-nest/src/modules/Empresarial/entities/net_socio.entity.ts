import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Net_Sociedad_Socio } from './net_sociedad_socio.entity';

@Entity({ name: 'NET_SOCIO' })
export class Net_Socio {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_SOCIO', primaryKeyConstraintName: 'PK_id_socio' })
  id_socio: number;

  @Column('varchar2', { length: 255, nullable: false, name: 'NOMBRE' })
  nombre: string;

  @Column('varchar2', { length: 255, nullable: false, name: 'APELLIDO' })
  apellido: string;

  @Column('varchar2', { length: 20, nullable: false, unique: true, name: 'DNI' })
  dni: string;

  @Column('varchar2', { length: 255, nullable: true, name: 'DIRECCION' })
  direccion: string;

  @Column('varchar2', { length: 20, nullable: true, name: 'TELEFONO' })
  telefono: string;

  @Column('varchar2', { length: 255, nullable: true, name: 'EMAIL' })
  email: string;

  @OneToMany(() => Net_Sociedad_Socio, sociedadSocio => sociedadSocio.socio)
  sociedadSocios: Net_Sociedad_Socio[];
}
