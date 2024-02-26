import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Net_Usuario } from './net_usuario.entity';

@Entity()
export class Net_Rol {
    @PrimaryGeneratedColumn('uuid')
    id_rol: string;

    @Column('varchar2', { length: 20, nullable: true })
    nombre_rol: string;

    @Column('varchar2', { length: 200, nullable: true })
    descripcion: string;

    @OneToMany(() => Net_Usuario, usuario => usuario.rol)
    usuarios: Net_Usuario[];
}