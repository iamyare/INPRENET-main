import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'NET_HISTORIAL_PAGOS_PENDIENTES' })
export class Net_Historial_Pagos_Pendientes {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_HISTORIAL_PAGO_PENDIENTE' })
  id_historial_pago_pendiente: number;

  @Column({ type: 'int', name: 'ID_PERSONA' })
  id_persona: number;

  @Column({ type: 'int', name: 'ID_AF_BANCO' })
  id_af_banco: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'MONTO_PAGADO' })
  monto_pagado: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'MONTO_TOTAL_PAGADO' })
  monto_total_pagado: number;

  @Column({ type: 'varchar2', length: 500, name: 'DESCRIPCION_RESOLUCION' })
  descripcion_resolucion: string;

  @Column({ type: 'varchar2', length: 1000, name: 'ID_PLANILLAS' })
  id_planillas: string; 

  @CreateDateColumn({ name: 'FECHA_ACTUALIZACION' })
  fecha_actualizacion: Date;
}
