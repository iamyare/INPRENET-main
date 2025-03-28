import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('net_deducciones_temp')
export class net_deducciones_temp {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_DEDUCCIONES_TEMP', primaryKeyConstraintName: 'PK_ID_DEDUCCIONES_TEMP' })
    id_deducciones_temp: number | undefined;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ nullable: false })
    codigoDeduccion: number;

    @Column({ nullable: true })
    n_prestamo_inprema: string;

    @Column({ nullable: true })
    tipo_prestamo_inprema: string;

    @Column({ nullable: false })
    anio: number;

    @Column({ nullable: false })
    mes: number;

    @Column({ nullable: false })
    dni: string;

    @Column('decimal', { precision: 10, scale: 2 })
    montoTotal: number;

}