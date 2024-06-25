import { Column, Entity, Index, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Net_Empleado_Centro_Trabajo } from './net_empleado_centro_trabajo.entity';

@Entity({ name: 'NET_EMPLEADO' })
export class Net_Empleado {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_EMPLEADO', primaryKeyConstraintName: 'PK_id_empleado' })
  id_empleado: number;

  @Column('varchar2', { length: 100, nullable: false, name: 'NOMBRE_EMPLEADO' })
  nombreEmpleado: string;

  @Column('varchar2', { nullable: true, name: 'TELEFONO_1' })
  telefono_1: string;

  @Column('varchar2', { nullable: true, name: 'TELEFONO_2' })
  telefono_2: string;

  @Column('varchar2', { length: 20, nullable: true, name: 'NUMERO_IDENTIFICACION' })
  @Index("UQ_numIdent_empleadoBase", { unique: true })
  numero_identificacion: string;

  @Column('blob', { nullable: true, name: 'ARCHIVO_IDENTIFICACION' })
  archivo_identificacion: Buffer;

  @Column('blob', { nullable: true, name: 'FOTO_EMPLEADO' })
  foto_empleado: Buffer;

  @OneToMany(() => Net_Empleado_Centro_Trabajo, empleadoCentroTrabajo => empleadoCentroTrabajo.empleado)
  empleadoCentroTrabajos: Net_Empleado_Centro_Trabajo[];
}
