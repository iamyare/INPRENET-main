import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Net_Modulo } from './net_modulo.entity';
import { Net_Usuario_Modulo } from './net_usuario_modulo.entity';

@Entity({ name: 'NET_ROL_MODULO' })
export class Net_Rol_Modulo {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_ROL_MODULO', primaryKeyConstraintName: 'PK_id_rol_modulo' })
  id_rol_modulo: number;

  @Column('varchar2', { length: 50, name: 'NOMBRE' })
  nombre: string;

  @Column('varchar2', { length: 255, name: 'DESCRIPCION', nullable: true })
  descripcion: string;

  @ManyToOne(() => Net_Modulo, modulo => modulo.roles, { nullable: false })
  @JoinColumn({ name: 'ID_MODULO', referencedColumnName: 'id_modulo', foreignKeyConstraintName: 'FK_id_modulo_rol_modulo' })
  modulo: Net_Modulo;

  @OneToMany(() => Net_Usuario_Modulo, usuarioModulo => usuarioModulo.rolModulo)
  usuarios: Net_Usuario_Modulo[];
}
