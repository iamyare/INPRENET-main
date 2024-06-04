import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, OneToMany } from 'typeorm';
import { Net_Empleado } from './net_empleado.entity';
import { Net_Rol_Empresa } from 'src/modules/usuario/entities/net_rol_empresa.entity';
import { Net_Centro_Trabajo } from './net_centro_trabajo.entity';
import { Net_Usuario_Empresa } from 'src/modules/usuario/entities/net_usuario_empresa.entity';

@Entity({ name: 'NET_EMPLEADO_CENTRO_TRABAJO' })
export class Net_Empleado_Centro_Trabajo {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_EMPLEADO_CENTRO_TRABAJO', primaryKeyConstraintName: 'PK_id_empleado_centro_trabajo' })
  id_empleado_centro_trabajo: number;

  @ManyToOne(() => Net_Empleado, empleado => empleado.empleadoCentroTrabajos)
  @JoinColumn({ name: 'ID_EMPLEADO', foreignKeyConstraintName: 'FK_id_empleado' })
  empleado: Net_Empleado;

  @ManyToOne(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.empleadoCentroTrabajos)
  @JoinColumn({ name: 'ID_CENTRO_TRABAJO', foreignKeyConstraintName: 'FK_id_centro_trab' })
  centroTrabajo: Net_Centro_Trabajo;

  @Column('varchar2', { length: 200, nullable: false, name: 'CORREO_1' })
  correo_1: string;

  @Column('varchar2', { length: 200, nullable: true, name: 'CORREO_2' })
  correo_2: string;

  @Column('date', { nullable: false, name: 'FECHA_CONTRATACION' })
  fechaContratacion: Date;

  @OneToMany(() => Net_Usuario_Empresa, usuarioEmpresa => usuarioEmpresa.empleadoCentroTrabajo)
  usuarioEmpresas: Net_Usuario_Empresa[];
}
