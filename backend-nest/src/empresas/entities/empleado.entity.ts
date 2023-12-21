import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { EmpleadoEmpresa } from './empleado-empresa.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { TipoIdentificacion } from 'src/tipo_identificacion/entities/tipo_identificacion.entity';

@Entity()
export class Empleado{
        
        @PrimaryGeneratedColumn('uuid')
        @OneToMany(
                () => EmpleadoEmpresa,
                (empleadoEmpresa) => empleadoEmpresa.id_empleado,
                { cascade: true}
        )
        id_empleado : string;
        
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
        @JoinColumn()
            usuario: Usuario;

        @OneToOne(() => TipoIdentificacion, { cascade: true })
        @JoinColumn()
        tipoIdentificacion: TipoIdentificacion;
}