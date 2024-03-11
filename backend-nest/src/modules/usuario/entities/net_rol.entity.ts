import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Net_Usuario } from './net_usuario.entity';

@Entity({ name: 'NET_ROL' })
export class Net_Rol {
    @PrimaryGeneratedColumn( { type: 'int', name: 'ID_ROL', primaryKeyConstraintName: 'PK_id_rol_rol'  })
    id_rol: number;

    @Column('varchar2', { length: 20, nullable: true, name: 'NOMBRE_ROL' })
    nombre_rol: string;

    @Column('varchar2', { length: 200, nullable: true, name: 'DESCRIPCION' })
    descripcion: string;

    @OneToMany(() => Net_Usuario, usuario => usuario.rol)
    usuarios: Net_Usuario[];
}