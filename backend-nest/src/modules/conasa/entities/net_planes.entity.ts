import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Net_Categoria } from './net_categorias.entity';

@Entity({ name: 'NET_PLANES' })
export class Net_Plan {
  @PrimaryGeneratedColumn({ name: 'ID_PLAN' })
  id_plan: number;

  @ManyToOne(() => Net_Categoria, (categoria) => categoria.planes, { cascade: true })
  @JoinColumn({ name: 'ID_CATEGORIA', foreignKeyConstraintName: 'FK_NET_CATEGORIA' })
  categoria: Net_Categoria;

  @Column({ name: 'TIPO_AFILIACION', type: 'number', nullable: true })
  tipo_afiliacion: number;
  
  @Column({ name: 'NOMBRE_PLAN', type: 'varchar2', length: 100 })
  nombre_plan: string;

  @Column({ name: 'PRECIO', type: 'number' })
  precio: number;

  @Column({ name: 'PROTECCION_PARA', type: 'number' })
  proteccion_para: number;

  @Column({ name: 'DESCRIPCION', type: 'varchar2', length: 255, nullable: true })
  descripcion: string;
}
