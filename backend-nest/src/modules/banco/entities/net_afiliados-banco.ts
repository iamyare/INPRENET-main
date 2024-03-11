import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Banco } from "./net_banco.entity";
// import { BeneficioPlanilla } from "src/modules/Planilla/beneficio_planilla/entities/detalle_beneficio.entity";
import { Net_Persona } from "src/modules/afiliado/entities/Net_Persona";

@Entity({name:'NET_AFILIADOS_POR_BANCO'})
export class Net_Afiliados_Por_Banco {
    @PrimaryGeneratedColumn('uuid',{name:'ID_AF_BANCO', primaryKeyConstraintName: 'PK_id_af_banco_AfilBan'})
    id_af_banco : string;
    
    @Column('varchar2', {nullable: false, length:20,name:'NUM_CUENTA '})
    @Index("UQ_numCuen_netAfilBanco", {unique:true})
    num_cuenta: string;

    @Column('varchar2', {nullable: false, length:20,name:'ESTADO'})
    estado:string;

    @ManyToOne(() => Net_Banco, banco => banco.afiliadosDeBanco, { cascade: true })
    @JoinColumn({ name: 'ID_BANCO' })
    banco : Net_Banco;

    @ManyToOne(() => Net_Persona, afiliado => afiliado.afiliadosPorBanco, { cascade: true })
    @JoinColumn({ name: 'ID_PERSONA' })
    afiliado : Net_Persona;


}