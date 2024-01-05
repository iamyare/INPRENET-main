import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Empresa } from "./empresa.entity";
import { Empleado } from "./empleado.entity";

@Entity()
export class EmpleadoEmpresa {

    @PrimaryGeneratedColumn('uuid')
    id: string;
   
    @ManyToOne(
        () => Empresa,
        ( empresa ) => empresa.id_empresa
    )
    id_empresa : Empresa

    @ManyToOne(() => Empleado, empleado => empleado.empleadoEmpresa, { cascade: true })
    @JoinColumn({ name: 'id_empleado' })
    empleado: Empleado;


  }