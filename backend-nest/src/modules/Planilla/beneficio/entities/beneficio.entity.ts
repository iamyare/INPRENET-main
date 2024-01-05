import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BeneficioPlanilla } from "../../beneficio_planilla/entities/beneficio_planilla.entity";

@Entity()
export class Beneficio {

    @PrimaryGeneratedColumn('uuid')
    id_beneficio : string;

    @OneToMany(() => BeneficioPlanilla, beneficioPlanilla => beneficioPlanilla.beneficio)
    beneficioPlanilla : BeneficioPlanilla[];
}