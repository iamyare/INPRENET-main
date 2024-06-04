import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { Net_Sociedad_Socio } from './net_sociedad_socio.entity';
import { Net_Municipio } from 'src/modules/Regional/municipio/entities/net_municipio.entity';

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

  @Column('varchar2', { length: 255, nullable: true, name: 'DIRECCION_1' })
  direccion_1: string;

  @Column('varchar2', { length: 255, nullable: true, name: 'DIRECCION_2' })
  direccion_2: string;

  @Column('varchar2', { length: 20, nullable: true, name: 'TELEFONO' })
  telefono: string;

  @Column('varchar2', { length: 255, nullable: true, name: 'EMAIL' })
  email: string;

  @OneToMany(() => Net_Sociedad_Socio, sociedadSocio => sociedadSocio.socio)
  sociedadSocios: Net_Sociedad_Socio[];

  @ManyToOne(() => Net_Municipio, municipio => municipio.socios)
  @JoinColumn({ name: 'ID_MUNICIPIO', foreignKeyConstraintName: 'FK_id_municipio_socio' })
  municipio: Net_Municipio;
}
