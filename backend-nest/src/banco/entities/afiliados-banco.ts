import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Banco } from "./banco.entity";
import { BeneficioPlanilla } from "src/modules/Planilla/beneficio_planilla/entities/beneficio_planilla.entity";
import { Afiliado } from "src/afiliado/entities/afiliado";

@Entity()
export class AfiliadosPorBanco {
    @PrimaryGeneratedColumn('uuid')
    id_af_banco : string;
    
    @Column('varchar2', {unique: true ,nullable: false, length:20})
    num_cuenta

    @ManyToOne(() => Banco, banco => banco.afiliadosDeBanco, { cascade: true })
    @JoinColumn({ name: 'id_banco' })
    banco : Banco;

    @ManyToOne(() => Afiliado, afiliado => afiliado.afiliadosPorBanco, { cascade: true })
    @JoinColumn({ name: 'id_afiliado' })
    afiliado : Afiliado;


}