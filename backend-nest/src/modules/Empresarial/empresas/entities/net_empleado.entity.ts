import { Column, Entity, Index, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Net_Empleado_Empresa } from "./net_empleado-empresa.entity";
import {  Net_TipoIdentificacion } from "src/modules/tipo_identificacion/entities/net_tipo_identificacion.entity";
import { Net_Usuario } from "src/modules/usuario/entities/net_usuario.entity";


@Entity()
export class Net_Empleado{
        
        @PrimaryGeneratedColumn('uuid')
        ID_EMPLEADO : string;

        @Column('varchar2', { length: 30, nullable: true })
                NOMBRE_EMPLEADO: string;
        
        @Column('varchar2', {
                length : 40,
                nullable : true
        })
        NOMBRE_PUESTO : string;

        @Column('varchar2', {
                nullable : true
        })
        NUMERO_EMPLEADO : string;

        @Column('varchar2', {
                nullable : true
        })
        TELEFONO_EMPLEADO
        
        @Column('varchar2')
        @Index("UQ_numIdent_netEmpl", {unique:true})
        NUMERO_IDENTIFICACION

        @Column('varchar2', {
                nullable : false
        })
        ARCHIVO_IDENTIFICACION : string;

        @OneToOne(() =>  Net_Usuario, { cascade: true })
        @JoinColumn({ name: 'ID_USUARIO' })
        usuario:  Net_Usuario;

        @OneToOne(() =>  Net_TipoIdentificacion, { cascade: true })
        @JoinColumn({ name: 'ID_IDENTIFICACION' })
        tipo_identificacion: Net_TipoIdentificacion;
        

        @OneToMany(() => Net_Empleado_Empresa, empleadoEmpresa => empleadoEmpresa.id_empleado)
        empleadoEmpresa : Net_Empleado_Empresa[];
}