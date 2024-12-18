import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { net_persona } from 'src/modules/Persona/entities/net_persona.entity';

@Entity({ name: 'NET_CONSULTAS_MEDICAS' })
export class Net_Consultas_Medicas {
  @PrimaryGeneratedColumn({ name: 'ID_CONSULTA' })
  id_consulta: number;

  @ManyToOne(() => net_persona)
  @JoinColumn({ name: 'ID_PERSONA', foreignKeyConstraintName: 'FK_NET_CONSULTA_PERSONA' })
  persona: net_persona;

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

  @Column({ name: 'DETALLE_ATENCION', type: 'varchar2', length: 500 })
  detalle_atencion: string;

  @Column({ name: 'FECHA_CIERRE', type: 'date', nullable: true })
  fecha_cierre: string;
}
