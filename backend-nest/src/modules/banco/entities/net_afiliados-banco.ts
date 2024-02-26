import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Banco } from "./net_banco.entity";
// import { BeneficioPlanilla } from "src/modules/Planilla/beneficio_planilla/entities/detalle_beneficio.entity";
import { Net_Afiliado } from "src/modules/afiliado/entities/net_afiliado";

@Entity()
export class Net_Afiliados_Por_Banco {
    @PrimaryGeneratedColumn('uuid')
    id_af_banco : string;
    
    @Column('varchar2', {unique: true ,nullable: false, length:20})
    num_cuenta

    @ManyToOne(() => Net_Banco, banco => banco.afiliadosDeBanco, { cascade: true })
    @JoinColumn({ name: 'id_banco' })
    banco : Net_Banco;

    @ManyToOne(() => Net_Afiliado, afiliado => afiliado.afiliadosPorBanco, { cascade: true })
    @JoinColumn({ name: 'id_afiliado' })
    afiliado : Net_Afiliado;


}