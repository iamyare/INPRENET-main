import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { net_modulo } from './net_modulo.entity';
import { net_usuario_modulo } from './net_usuario_modulo.entity';

@Entity({ name: 'NET_ROL_MODULO' })
export class net_rol_modulo {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_ROL_MODULO', primaryKeyConstraintName: 'PK_id_rol_modulo' })
  id_rol_modulo: number;

  @Column('varchar2', { length: 50, name: 'NOMBRE' })
  nombre: string;

  @Column('varchar2', { length: 255, name: 'DESCRIPCION', nullable: true })
  descripcion: string;

  @ManyToOne(() => net_modulo, modulo => modulo.roles, { nullable: false })
  @JoinColumn({ name: 'ID_MODULO', referencedColumnName: 'id_modulo', foreignKeyConstraintName: 'FK_id_modulo_rol_modulo' })
  modulo: net_modulo;

  @OneToMany(() => net_usuario_modulo, usuarioModulo => usuarioModulo.rolModulo)
  usuarios: net_usuario_modulo[];
}
