import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { EmpleadoEmpresa } from "./empleado-empresa.entity";
import { TipoIdentificacion } from "src/modules/tipo_identificacion/entities/tipo_identificacion.entity";
import { Usuario } from "src/modules/usuario/entities/usuario.entity";


@Entity()
export class Empleado{
        
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

        @OneToOne(() => Usuario, { cascade: true })
        @JoinColumn({ name: 'id_usuario' })
        usuario: Usuario;

        @OneToOne(() => TipoIdentificacion, { cascade: true })
        @JoinColumn({ name: 'id_tipoIdentificacion' })
        tipo_identificacion: TipoIdentificacion;
        

        @OneToMany(() => EmpleadoEmpresa, empleadoEmpresa => empleadoEmpresa.id_empleado)
        empleadoEmpresa : EmpleadoEmpresa[];
}