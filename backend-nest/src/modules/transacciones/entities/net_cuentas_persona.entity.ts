import { Net_Persona } from "src/modules/afiliado/entities/Net_Persona";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { NET_TIPOS_CUENTA } from "./net_tipos_cuenta.entitiy";
import { NET_MOVIMIENTO_CUENTA } from "./net_movimiento_cuenta.entity";

@Entity({name:'NET_CUENTAS_PERSONA'})
export class NET_CUENTAS_PERSONA {
    
    @PrimaryGeneratedColumn({type: 'int',name: 'ID_CUENTA_PERSONA', primaryKeyConstraintName: 'PK_cuenta_persona'})
    ID_CUENTA_PERSONA : number;

    @ManyToOne(() => Net_Persona, persona => persona.cuentas)
    @JoinColumn({ name: 'ID_PERSONA', referencedColumnName: 'id_persona'})
    persona: Net_Persona;

    @ManyToOne(() => NET_TIPOS_CUENTA, tipoCuenta => tipoCuenta.cuentas)
    @JoinColumn({ name: 'ID_TIPO_CUENTA' })
    tipoCuenta: NET_TIPOS_CUENTA;

    @OneToMany(() => NET_MOVIMIENTO_CUENTA, movimientoCuenta => movimientoCuenta.cuentaPersona)
    movimientos: NET_MOVIMIENTO_CUENTA[];    

    @Column()
    NUMERO_CUENTA: string;

}
