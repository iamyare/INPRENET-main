import { Column, Entity, Index, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Net_Empleado_Empresa } from "./net_empleado-empresa.entity";
import {  Net_TipoIdentificacion } from "src/modules/tipo_identificacion/entities/net_tipo_identificacion.entity";
import { Net_Usuario } from "src/modules/usuario/entities/net_usuario.entity";


@Entity({ name: 'NET_EMPLEADO' })
export class Net_Empleado {
        
    @PrimaryGeneratedColumn({type: 'int', name: 'ID_EMPLEADO', primaryKeyConstraintName: 'PK_id_empleado_empleado' })
    id_empleado: number;

    @Column('varchar2', { length: 30, nullable: true, name: 'NOMBRE_EMPLEADO' })
    nombre_empleado: string;
    
    @Column('varchar2', { length: 40, nullable: true, name: 'NOMBRE_PUESTO' })
    nombre_puesto: string;

    @Column('varchar2', { nullable: true, name: 'NUMERO_EMPLEADO' })
    numero_empleado: string;

    @Column('varchar2', { nullable: true, name: 'TELEFONO_EMPLEADO' })
    telefono_empleado: string;

    @Column('varchar2', { name: 'NUMERO_IDENTIFICACION' })
    @Index("UQ_numIdent_netEmpl", { unique:true })
    numero_identificacion: string;

    @Column('varchar2', { nullable: false, name: 'ARCHIVO_IDENTIFICACION' })
    archivo_identificacion: string;

    @OneToOne(() => Net_Usuario, { cascade: true })
    @JoinColumn({ name: 'ID_USUARIO', foreignKeyConstraintName:"FK_ID_USUARIO_EMPLEADO" })
    usuario: Net_Usuario;

    @OneToOne(() => Net_TipoIdentificacion, { cascade: true })
    @JoinColumn({ name: 'ID_IDENTIFICACION', foreignKeyConstraintName:"FK_ID_IDENTIFICACION_EMPLEADO" })
    tipo_identificacion: Net_TipoIdentificacion;

    @OneToMany(() => Net_Empleado_Empresa, empleadoEmpresa => empleadoEmpresa.id_empleado)
    empleadoEmpresa: Net_Empleado_Empresa[];
}