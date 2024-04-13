import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Net_Empresa } from "./net_empresa.entity";
import { Net_Empleado } from "./net_empleado.entity";

@Entity({ name: 'NET_EMPLEADO_EMPRESA' })
export class Net_Empleado_Empresa {

    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_EMPLEADO_EMPRESA', primaryKeyConstraintName: 'PK_id_empleado_empresa' })
    id_empleado_empresa: number;
   
    @ManyToOne(() => Net_Empresa, (empresa) => empresa.id_empresa)
    @JoinColumn({ name: 'ID_EMPRESA', foreignKeyConstraintName:"FK_ID_EMPRESA_EMPEMP" })
    id_empresa: Net_Empresa;

    @ManyToOne(() => Net_Empleado, (empleado) => empleado.id_empleado)
    @JoinColumn({ name: 'ID_EMPLEADO', foreignKeyConstraintName:"FK_ID_EMPLEADO_EMPEMP" })
    id_empleado: Net_Empleado;
}