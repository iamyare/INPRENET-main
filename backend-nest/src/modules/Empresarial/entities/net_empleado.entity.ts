import { Net_Usuario_Empresa } from 'src/modules/usuario/entities/net_usuario_empresa.entity';
import { Column, Entity, Index, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity({ name: 'NET_EMPLEADO' })
export class Net_Empleado {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_EMPLEADO', primaryKeyConstraintName: 'PK_id_empleado' })
  id_empleado: number;

  @Column('varchar2', { name: 'NOMBRE_EMPLEADO' })
  nombreEmpleado: string;

  @Column('varchar2', { name: 'TELEFONO_EMPLEADO', nullable: true })
  telefonoEmpleado: string;

  @Column('varchar2', { name: 'NUMERO_IDENTIFICACION', nullable: true })
  @Index("UQ_numIdent_empleadoBase", { unique: true })
  numero_identificacion: string;

  @Column('blob', { nullable: true, name: 'ARCHIVO_IDENTIFICACION' })
  archivo_identificacion: Buffer;

  @OneToMany(() => Net_Usuario_Empresa, usuarioEmpresa => usuarioEmpresa.user)
  usuarioEmpresas: Net_Usuario_Empresa[];
}
