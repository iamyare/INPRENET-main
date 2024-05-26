import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { NET_SESION } from './net_sesion.entity';
import { Net_Empleado } from 'src/modules/Empresarial/entities/net_empleado.entity';
import { Net_Seguridad } from './net_seguridad.entity';
import { Net_Rol_Empresa } from './net_rol_empresa.entity';

@Entity({ name: 'NET_USUARIO_EMPRESA' })
export class Net_Usuario_Empresa {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_USUARIO_EMPRESA', primaryKeyConstraintName: 'PK_id_usuario_empresa' })
  id_usuario_empresa: number;

  @ManyToOne(() => Net_Empleado, user => user.usuarioEmpresas, { nullable: false })
  @JoinColumn({ name: 'ID_EMPLEADO', referencedColumnName: 'id_empleado', foreignKeyConstraintName: 'FK_empleado_usuarioEmpresa' })
  user: Net_Empleado;

  @ManyToOne(() => Net_Rol_Empresa, role => role.usuarioEmpresas, { nullable: false })
  @JoinColumn({ name: 'ID_ROLE', referencedColumnName: 'id_rol_empresa', foreignKeyConstraintName: 'FK_role_usuarioEmpresa' })
  role: Net_Rol_Empresa;

  @Column('varchar2', { length: 255, nullable: false, name: 'NOMBRE_PUESTO' })
  nombrePuesto: string;

  @Column('varchar2', { length: 255, nullable: false, name: 'NUMERO_EMPLEADO' })
  numeroEmpleado: string;

  @Column('varchar2', { length: 50, default: 'INACTIVO', name: 'ESTADO' })
  estado: string;

  @Column('varchar2', { length: 200, nullable: false, name: 'CORREO' })
  correo: string;

  @Column('varchar2', { length: 200, nullable: false, name: 'CONTRASENA' })
  contrasena: string;

  @CreateDateColumn({ type: 'timestamp', name: 'FECHA_CREACION' })
  fecha_creacion: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'FECHA_VERIFICACION' })
  fecha_verificacion: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'FECHA_MODIFICACION' })
  fecha_modificacion: Date;

  @OneToMany(() => Net_Seguridad, seguridad => seguridad.usuarioEmpresa)
  seguridad: Net_Seguridad[];

  @OneToMany(() => NET_SESION, sesion => sesion.usuario)
  sesiones: NET_SESION[];
}
