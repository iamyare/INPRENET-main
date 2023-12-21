import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity()
export class Rol {
    @PrimaryGeneratedColumn('uuid')
    id_rol: string;

    @Column('varchar2', { length: 20, nullable: true })
    nombre: string;

    @Column('varchar2', { length: 200, nullable: true })
    descripcion: string;

    @OneToMany(() => Usuario, usuario => usuario.rol)
    usuarios: Usuario[];
}