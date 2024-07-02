import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { net_rol_modulo } from './net_rol_modulo.entity';
import { Net_Centro_Trabajo } from 'src/modules/Empresarial/entities/net_centro_trabajo.entity';
import { net_usuario_modulo } from './net_usuario_modulo.entity';

@Entity({ name: 'NET_MODULO' })
export class net_modulo {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_MODULO', primaryKeyConstraintName: 'PK_id_modulo' })
  id_modulo: number;

  @Column('varchar2', { length: 100, name: 'NOMBRE' })
  nombre: string;

  @Column('varchar2', { length: 255, name: 'DESCRIPCION', nullable: true })
  descripcion: string;

  @ManyToOne(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.modulos, { nullable: false })
  @JoinColumn({ name: 'ID_CENTRO_TRABAJO', referencedColumnName: 'id_centro_trabajo', foreignKeyConstraintName: 'FK_id_centro_trabajo_modulo' })
  centroTrabajo: Net_Centro_Trabajo;

  @OneToMany(() => net_rol_modulo, rolModulo => rolModulo.modulo)
  roles: net_rol_modulo[];

  @OneToMany(() => net_usuario_modulo, usuarioModulo => usuarioModulo.rolModulo)
  usuarios: net_usuario_modulo[];
}
