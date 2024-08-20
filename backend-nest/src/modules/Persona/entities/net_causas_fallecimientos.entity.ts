import { Column, Entity, Index,OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { net_persona } from "./net_persona.entity";

@Entity({
    name: 'NET_CAUSAS_FALLECIMIENTOS',
})
export class net_causas_fallecimientos {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_CAUSA_FALLECIMIENTO', primaryKeyConstraintName: 'PK_ID_CAUSA_FALLECIMIENTO' })
    id_causa_fallecimiento: number;

    @Column('varchar2', { length: 100, nullable: false, name: 'NOMBRE' })
    @Index("UQ_NOMBRE_NET_CAUSA_FALLECIMIENTOS", { unique: true })
    nombre: string;

    @OneToMany(() => net_persona, persona => persona.causa_fallecimiento)
    personas: net_persona[];
}