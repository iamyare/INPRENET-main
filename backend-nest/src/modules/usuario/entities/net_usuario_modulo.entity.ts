import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Net_Usuario_Empresa } from './net_usuario_empresa.entity';
import { net_rol_modulo } from './net_rol_modulo.entity';

@Entity({ name: 'NET_USUARIO_MODULO' })
export class net_usuario_modulo {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_USUARIO_MODULO', primaryKeyConstraintName: 'PK_id_usuario_modulo' })
  id_usuario_modulo: number;

  @ManyToOne(() => Net_Usuario_Empresa, usuarioEmpresa => usuarioEmpresa.usuarioModulos, { nullable: false })
  @JoinColumn({ name: 'ID_USUARIO_EMPRESA', referencedColumnName: 'id_usuario_empresa', foreignKeyConstraintName: 'FK_id_usuario_empresa_usuario_modulo' })
  usuarioEmpresa: Net_Usuario_Empresa;

  @ManyToOne(() => net_rol_modulo, rolModulo => rolModulo.usuarios, { nullable: false })
  @JoinColumn({ name: 'ID_ROL_MODULO', referencedColumnName: 'id_rol_modulo', foreignKeyConstraintName: 'FK_id_rol_modulo_usuario_modulo' })
  rolModulo: net_rol_modulo;
}
