import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Banco } from "./net_banco.entity";
// import { BeneficioPlanilla } from "src/modules/Planilla/beneficio_planilla/entities/detalle_beneficio.entity";
import { Net_Persona } from "src/modules/afiliado/entities/Net_Persona";

@Entity()
export class Net_Afiliados_Por_Banco {
    @PrimaryGeneratedColumn('uuid')
    id_af_banco : string;
    
    @Column('varchar2', {nullable: false, length:20})
    @Index("UQ_numCuen_netAfilBanco", {unique:true})
    num_cuenta

    @Column('varchar2', {nullable: false, length:20})
    estado

    @ManyToOne(() => Net_Banco, banco => banco.afiliadosDeBanco, { cascade: true })
    @JoinColumn({ name: 'id_banco' })
    banco : Net_Banco;

    @ManyToOne(() => Net_Persona, afiliado => afiliado.afiliadosPorBanco, { cascade: true })
    @JoinColumn({ name: 'id_afiliado' })
    afiliado : Net_Persona;


}