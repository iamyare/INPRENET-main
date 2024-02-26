import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Net_Empleado_Empresa } from "./net_empleado-empresa.entity";
import {  Net_TipoIdentificacion } from "src/modules/tipo_identificacion/entities/net_tipo_identificacion.entity";
import { Net_Usuario } from "src/modules/usuario/entities/net_usuario.entity";


@Entity()
export class Net_Empleado{
        
        @PrimaryGeneratedColumn('uuid')
        id_empleado : string;

        @Column('varchar2', { length: 30, nullable: true })
                nombre_empleado: string;
        
        @Column('varchar2', {
                length : 40,
                nullable : true
        })
        nombre_puesto : string;

        @Column('varchar2', {
                nullable : true
        })
        numero_empleado : string;

        @Column('varchar2', {
                nullable : true
        })
        telefono_empleado
        
        @Column('varchar2', {
                unique : true
        })
        numero_identificacion

        @Column('varchar2', {
                nullable : false
        })
        archivo_identificacion

        @OneToOne(() =>  Net_Usuario, { cascade: true })
        @JoinColumn({ name: 'id_usuario' })
        usuario:  Net_Usuario;

        @OneToOne(() =>  Net_TipoIdentificacion, { cascade: true })
        @JoinColumn({ name: 'id_tipoIdentificacion' })
        tipo_identificacion: Net_TipoIdentificacion;
        

        @OneToMany(() => Net_Empleado_Empresa, empleadoEmpresa => empleadoEmpresa.id_empleado)
        empleadoEmpresa : Net_Empleado_Empresa[];
}