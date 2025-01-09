import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'NET_CONSULTAS_MEDICAS' })
export class Net_Consultas_Medicas {
  @PrimaryGeneratedColumn({ name: 'ID_CONSULTA' })
  id_consulta: number;

  @Column({ name: 'DNI', type: 'varchar2', length: 13 })
  dni: string;

  @Column({ name: 'FECHA_CONSULTA', type: 'date' })
  fecha_consulta: string;

  @Column({ name: 'MOTIVO_CONSULTA', type: 'varchar2', length: 255 })
  motivo_consulta: string;

  @Column({ name: 'TIEMPO_SINTOMAS', type: 'varchar2', length: 50 })
  tiempo_sintomas: string;

  @Column({ name: 'TIPO_ATENCION', type: 'varchar2', length: 50 })
  tipo_atencion: string;

  @Column({ name: 'TRIAGE', type: 'varchar2', length: 10 })
  triage: string;

  @Column({ name: 'DIAGNOSTICO_PRESUNTIVO', type: 'varchar2', length: 255 })
  diagnostico_presuntivo: string;

  @Column({ name: 'DETALLE_ATENCION', type: 'varchar2', length: 500, nullable: true })
  detalle_atencion: string;

  @Column({ name: 'FECHA_CIERRE', type: 'date', nullable: true })
  fecha_cierre: string;

  @CreateDateColumn({ name: 'FECHA_CREACION', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  @Column({ name: 'USUARIO_CREACION', type: 'varchar2', length: 255, nullable: true })
  usuario_creacion: string;
}
