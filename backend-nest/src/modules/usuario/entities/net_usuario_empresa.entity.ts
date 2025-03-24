import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Net_Seguridad } from './net_seguridad.entity';
import { net_usuario_modulo } from './net_usuario_modulo.entity';
import { Net_Empleado_Centro_Trabajo } from 'src/modules/Empresarial/entities/net_empleado_centro_trabajo.entity';
import { net_detalle_persona } from 'src/modules/Persona/entities/net_detalle_persona.entity';

@Entity({ name: 'NET_USUARIO_EMPRESA' })
export class Net_Usuario_Empresa {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_USUARIO_EMPRESA', primaryKeyConstraintName: 'PK_id_usuario_empresa' })
  id_usuario_empresa: number;

  @Column('varchar2', { length: 50, default: 'INACTIVO', name: 'ESTADO' })
  estado: string;

  @Column('varchar2', { length: 200, nullable: false, name: 'CONTRASENA' })
  contrasena: string;

  @Column({ type: 'number', default: 0, name: 'ACCESO_TODOS_MODULOS' })
  acceso_todos_modulos: number;

  @CreateDateColumn({ type: 'timestamp', name: 'FECHA_CREACION' })
  fecha_creacion: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'FECHA_VERIFICACION' })
  fecha_verificacion: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'FECHA_MODIFICACION' })
  fecha_modificacion: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'FECHA_DESACTIVACION' })
  fecha_desactivacion: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'FECHA_REACTIVACION' })
  fecha_reactivacion: Date;

  @OneToMany(() => Net_Seguridad, seguridad => seguridad.usuarioEmpresa)
  seguridad: Net_Seguridad[];

  @Column('varchar2', { length: 500, nullable: true, name: 'REFRESH_TOKEN' })
  refreshToken: string;

  @OneToMany(() => net_usuario_modulo, usuarioModulo => usuarioModulo.usuarioEmpresa)
  usuarioModulos: net_usuario_modulo[];

  @ManyToOne(() => Net_Empleado_Centro_Trabajo, empleadoCentroTrabajo => empleadoCentroTrabajo.usuarioEmpresas, { nullable: false })
  @JoinColumn({ name: 'ID_EMPLEADO_CENTRO_TRABAJO', referencedColumnName: 'id_empleado_centro_trabajo', foreignKeyConstraintName: 'FK_id_empleado_centro_trabajo_usuario_empresa' })
  empleadoCentroTrabajo: Net_Empleado_Centro_Trabajo;

  @OneToMany(() => net_detalle_persona, detallePersona => detallePersona.usuarioEmpresa)
  detallePersonas: net_detalle_persona[];
}
