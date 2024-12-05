import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Net_Plan } from './net_planes.entity';

@Entity({ name: 'NET_CATEGORIAS' })
export class Net_Categoria {
  @PrimaryGeneratedColumn({ name: 'ID_CATEGORIA' })
  id_categoria: number;

  @Column({ name: 'NOMBRE', type: 'varchar2', length: 100, unique: true })
  nombre: string;

  @OneToMany(() => Net_Plan, (plan) => plan.categoria)
  planes: Net_Plan[];
}
