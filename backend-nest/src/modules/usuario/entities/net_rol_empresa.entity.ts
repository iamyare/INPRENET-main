import { Net_Empleado_Centro_Trabajo } from 'src/modules/Empresarial/entities/net_empleado_centro_trabajo.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Net_Usuario_Empresa } from './net_usuario_empresa.entity';
import { Net_Centro_Trabajo } from 'src/modules/Empresarial/entities/net_centro_trabajo.entity';

@Entity({ name: 'NET_ROL_EMPRESA' })
export class Net_Rol_Empresa {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_ROL_EMPRESA', primaryKeyConstraintName: 'PK_id_rol_empresa' })
  id_rol_empresa: number;

  @ManyToOne(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.rolEmpresas)
  @JoinColumn({ name: 'ID_CENTRO_TRABAJO', foreignKeyConstraintName: 'FK_id_centro_trabajo' })
  centroTrabajo: Net_Centro_Trabajo;

  @Column('varchar2', { length: 50, nullable: false, name: 'NOMBRE' })
  nombre: string;

  @Column('varchar2', { length: 255, nullable: true, name: 'DESCRIPCION' })
  descripcion: string;

  @OneToMany(() => Net_Usuario_Empresa, usuarioEmpresa => usuarioEmpresa.rolEmpresa)
  usuarioEmpresas: Net_Usuario_Empresa[];
}
