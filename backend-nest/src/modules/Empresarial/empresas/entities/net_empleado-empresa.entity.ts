import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Net_Empresa } from "./net_empresa.entity";
import { Net_Empleado } from "./net_empleado.entity";

@Entity()
export class Net_Empleado_Empresa {

    @PrimaryGeneratedColumn('uuid')
    id: string;
   
    @ManyToOne(() => Net_Empresa, (empresa) => empresa.id_empresa)
    @JoinColumn({ name: 'id_empresa' })
    id_empresa: Net_Empresa

    @ManyToOne(() => Net_Empleado, (empleado) => empleado.id_empleado)
    @JoinColumn({ name: 'id_empleado' })
    id_empleado: Net_Empleado


  }