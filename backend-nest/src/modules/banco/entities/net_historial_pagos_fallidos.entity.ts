import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'NET_HISTORIAL_PAGOS_FALLIDOS' })
export class Net_Historial_Pagos_Fallidos {
  @PrimaryGeneratedColumn({ name: 'ID_HISTORIAL_PAGO_FALLIDO' })
  id_historial_pago_fallido: number;

  @Column({ name: 'ID_PLANILLA', type: 'int' })
  id_planilla: number;

  @Column({ name: 'FECHA_PROCESAMIENTO', type: 'varchar2', length: 8 })
  fecha_procesamiento: string;

  @Column({ name: 'NUMERO_IDENTIFICACION', type: 'varchar2', length: 20 })
  numero_identificacion: string;

  @Column({ name: 'MOTIVO_FALLO', type: 'varchar2', length: 255 })
  motivo_fallo: string;

  @CreateDateColumn({ name: 'FECHA_REGISTRO' })
  fecha_registro: Date;
}
