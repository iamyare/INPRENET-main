import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'NET_HISTORIAL_PAGO_PLANILLA' })
export class NetHistorialPagoPlanilla {
  @PrimaryGeneratedColumn({ name: 'ID_HISTORIAL_PAGO_PLANILLA' })
  id_historial_pago_planilla: number;

  @Column({ name: 'ID_PLANILLA', type: 'int' })
  id_planilla: number;

  @Column({ name: 'FECHA_PROCESAMIENTO', type: 'varchar2', length: 8 }) // Formato: YYYYMMDD
  fecha_procesamiento: string;

  @Column({ name: 'TOTAL_PAGOS_EXITOSOS', type: 'int', nullable: false }) // No permite NULL
  total_pagos_exitosos: number;

  @Column({ name: 'MONTO_PAGOS_EXITOSOS', type: 'decimal', nullable: false }) // No permite NULL
  monto_pagos_exitosos: number;

  @Column({ name: 'TOTAL_PAGOS_FALLIDOS', type: 'int' })
  total_pagos_fallidos: number;

  @Column({ name: 'MONTO_PAGOS_FALLIDOS', type: 'decimal', precision: 10, scale: 2 })
  monto_pagos_fallidos: number;
}
