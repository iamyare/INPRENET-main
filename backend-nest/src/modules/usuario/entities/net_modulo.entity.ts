import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Net_Rol_Modulo } from './net_rol_modulo.entity';
import { Net_Usuario_Modulo } from './net_usuario_modulo.entity';
import { Net_Centro_Trabajo } from 'src/modules/Empresarial/entities/net_centro_trabajo.entity';

@Entity({ name: 'NET_MODULO' })
export class Net_Modulo {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_MODULO', primaryKeyConstraintName: 'PK_id_modulo' })
  id_modulo: number;

  @Column('varchar2', { length: 100, name: 'NOMBRE' })
  nombre: string;

  @Column('varchar2', { length: 255, name: 'DESCRIPCION', nullable: true })
  descripcion: string;

  @ManyToOne(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.modulos, { nullable: false })
  @JoinColumn({ name: 'ID_CENTRO_TRABAJO', referencedColumnName: 'id_centro_trabajo', foreignKeyConstraintName: 'FK_id_centro_trabajo_modulo' })
  centroTrabajo: Net_Centro_Trabajo;

  @OneToMany(() => Net_Rol_Modulo, rolModulo => rolModulo.modulo)
  roles: Net_Rol_Modulo[];

  @OneToMany(() => Net_Usuario_Modulo, usuarioModulo => usuarioModulo.rolModulo)
  usuarios: Net_Usuario_Modulo[];
}
