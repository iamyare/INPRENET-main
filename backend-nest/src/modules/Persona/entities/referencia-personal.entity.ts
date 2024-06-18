import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Ref_Per_Pers } from "./net_ref-Per-Persona.entity";

@Entity({ name: 'NET_REFERENCIA_PERSONAL' })
export class Net_ReferenciaPersonal {

    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_REF_PERSONAL', primaryKeyConstraintName: 'PK_id_ref_per_refPer' })
    id_ref_personal: number;

    @Column('varchar2', {
        length: 50,
        nullable: false,
        name: 'NOMBRE_COMPLETO'
    })
    nombre_completo: string;

    @Column('varchar2', {
        length: 200,
        nullable: true,
        name: 'DIRECCION'
    })
    direccion: string;

    @Column('varchar2', {
        length: 30,
        nullable: false,
        name: 'PARENTESCO'
    })
    parentesco: string;

    @Column('varchar2', {
        length: 12,
        nullable: true,
        name: 'TELEFONO_DOMICILIO'
    })
    telefono_domicilio: string;

    @Column('varchar2', {
        length: 12,
        nullable: false,
        name: 'TELEFONO_TRABAJO'
    })
    telefono_trabajo: string;

    @Column('varchar2', {
        length: 12,
        nullable: false,
        name: 'TELEFONO_PERSONAL'
    })
    telefono_personal: string;

    @Column('varchar2', {
        length: 15,
        nullable: true,
        name: 'DNI'
    })
    dni: string;

    @OneToMany(() => Net_Ref_Per_Pers, referenciaPersonalAfiliado => referenciaPersonalAfiliado.referenciaPersonal)
    referenciasPersonalesAfiliado: Net_Ref_Per_Pers[];

}