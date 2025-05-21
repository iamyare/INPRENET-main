import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'NET_FACTURAS_CONASA' })
export class Net_Facturas_Conasa {
  @PrimaryGeneratedColumn({ name: 'ID_FACTURA' })
  id_factura: number;

  @Column({ name: 'TIPO_FACTURA', type: 'int', nullable: false })
  tipo_factura: number; // 1: Asistencia Médica, 2: Contratos Funerarios

  @Column({ name: 'PERIODO_FACTURA', type: 'varchar2', length: 7, nullable: false })
  periodo_factura: string;

  @Column({ name: 'ARCHIVO_PDF', type: 'blob', nullable: false })
  archivo_pdf: Buffer; // El archivo PDF almacenado como BLOB

  @CreateDateColumn({ name: 'FECHA_SUBIDA', type: 'timestamp' })
  fecha_subida: Date;

  @Column({ name: 'STATUS', type: 'varchar2', length: 10, default: 'PENDIENTE' })
  status: string; // 'PENDIENTE', 'APROBADO', 'RECHAZADO'

  @Column({ name: 'OBSERVACIONES', type: 'varchar2', length: 500, nullable: true })
  observaciones: string; // Campo opcional para comentarios
}
