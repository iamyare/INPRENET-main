import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Net_Usuario_Empresa } from './net_usuario_empresa.entity';

@Entity({ name: 'NET_SEGURIDAD' })
export class Net_Seguridad {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_SEGURIDAD', primaryKeyConstraintName: 'PK_id_seguridad' })
  id_seguridad: number;

  @ManyToOne(() => Net_Usuario_Empresa, usuarioEmpresa => usuarioEmpresa.seguridad, { nullable: false })
  @JoinColumn({ name: 'ID_USUARIO_EMPRESA', referencedColumnName: 'id_usuario_empresa', foreignKeyConstraintName: 'FK_usuarioEmpresa_seguridad' })
  usuarioEmpresa: Net_Usuario_Empresa;

  @Column('varchar2', { length: 100, nullable: false, name: 'PREGUNTA' })
  pregunta: string;

  @Column('varchar2', { length: 100, nullable: false, name: 'RESPUESTA' })
  respuesta: string;
}
