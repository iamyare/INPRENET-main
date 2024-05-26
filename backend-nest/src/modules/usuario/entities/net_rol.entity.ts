import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Net_Usuario_Empresa } from './net_usuario_empresa.entity';

@Entity({ name: 'NET_ROL' })
export class Net_Rol {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_ROL', primaryKeyConstraintName: 'PK_id_rol_rol' })
  id_rol: number;

  @Column('varchar2', { length: 20, nullable: true, name: 'NOMBRE_ROL' })
  nombre_rol: string;

  @Column('varchar2', { length: 200, nullable: true, name: 'DESCRIPCION' })
  descripcion: string;
}
