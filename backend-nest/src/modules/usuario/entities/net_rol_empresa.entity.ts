import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Net_Empresa } from 'src/modules/Empresarial/entities/net_empresa.entity';
import { Net_Usuario_Empresa } from './net_usuario_empresa.entity';

@Entity({ name: 'NET_ROL_EMPRESA' })
export class Net_Rol_Empresa {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_ROL_EMPRESA', primaryKeyConstraintName: 'PK_id_rol_empresa' })
  id_rol_empresa: number;

  @ManyToOne(() => Net_Empresa, empresa => empresa.roles, { nullable: false })
  @JoinColumn({ name: 'ID_EMPRESA', referencedColumnName: 'id_empresa', foreignKeyConstraintName: 'FK_empresa_rolEmpresa' })
  empresa: Net_Empresa;

  @Column('varchar2', { length: 20, nullable: true, name: 'NOMBRE_ROL' })
  nombre_rol: string;

  @Column('varchar2', { length: 200, nullable: true, name: 'DESCRIPCION' })
  descripcion: string;

  @Column('number', { default: 0, name: 'ES_GLOBAL' })
  es_global: number;

  @OneToMany(() => Net_Usuario_Empresa, usuarioEmpresa => usuarioEmpresa.role)
  usuarioEmpresas: Net_Usuario_Empresa[];
}
