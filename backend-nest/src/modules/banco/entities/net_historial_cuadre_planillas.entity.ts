import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'NET_HISTORIAL_CUADRE_PLANILLAS' })
export class NetHistorialCuadrePlanillas {
  @PrimaryGeneratedColumn({ name: 'ID_HISTORIAL_CUADRE' })
  id_historial_cuadre: number;

  @Column({ name: 'ID_PLANILLA', type: 'int' })
  id_planilla: number;

  @Column({ name: 'FECHA_CIERRE', type: 'varchar2', length: 8 })
  fecha_cierre: string;

  @Column({ name: 'SALDO_ACTUAL_RECHAZOS_BANCO', type: 'decimal', precision: 15, scale: 2 })
  saldo_actual_rechazos_banco: number;

  @Column({ name: 'SALDO_ACTUAL_RECHAZOS_INPREMA', type: 'decimal', precision: 15, scale: 2 })
  saldo_actual_rechazos_inprema: number;

  @Column({ name: 'TOTAL_PAGOS_PENDIENTES_BANCO', type: 'int', nullable: false })
  total_pagos_pendientes_banco: number;

  @Column({ name: 'TOTAL_PAGOS_PENDIENTES_INPREMA', type: 'int', nullable: false })
  total_pagos_pendientes_inprema: number;

  @Column({ name: 'TOTAL_PAGOS_DIFERENCIA', type: 'int' })
  total_pagos_diferencia: number;

  @Column({ name: 'DIFERENCIA_MONTO', type: 'decimal', precision: 15, scale: 2 })
  diferencia_monto: number;

  @Column({ name: 'DIFERENCIA_REGISTROS', type: 'int' })
  diferencia_registros: number;

  @Column({ name: 'ESTADO_CUADRE', type: 'varchar2', length: 50 })
  estado_cuadre: string;

  @CreateDateColumn({ name: 'FECHA_REGISTRO' })
  fecha_registro: Date;
}
