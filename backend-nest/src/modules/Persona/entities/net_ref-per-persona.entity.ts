import { Check, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'NET_REF_PER_PERS' })
@Check("CK_TIPO_REFERENCIA_NET_REF_PER_PERS", `TIPO_REFERENCIA IN ('REFERENCIA PERSONAL', 'REFERENCIA FAMILIAR')`)
@Check("CK_ESTADO_NET_REFE_PER_PERS", `ESTADO IN ('ACTIVO', 'INACTIVO')`)
export class Net_Ref_Per_Pers {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_REF_PERSONAL_AFIL', primaryKeyConstraintName: 'PK_ID_REF_PERSONAL_NET_REF_PER_PERS' })
    id_ref_personal_afil: number;

    @Column('varchar2', {
        length: 50,
        nullable: false,
        name: 'TIPO_REFERENCIA'
    })
    tipo_referencia: string;

    @Column('varchar2', {
        length: 30,
        nullable: false,
        name: 'PARENTESCO'
    })
    parentesco: string;

    @Column('varchar2', {
        length: 10,
        nullable: true,
        name: 'ESTADO',
        default: 'ACTIVO'
    })
    estado: string;
}
