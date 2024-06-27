import { Check, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Net_Ref_Per_Pers } from './net_ref-Per-Persona.entity';

@Entity({ name: 'NET_REFERENCIA_PERSONAL' })
@Check('CHECK_SEXO',`SEXO IN ('F', 'M')`)
export class Net_ReferenciaPersonal {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'ID_REF_PERSONAL',
    primaryKeyConstraintName: 'PK_id_ref_per_refPer',
  })
  id_ref_personal: number;

  @Column('varchar2', {
    length: 50,
    nullable: false,
    name: 'NOMBRE_COMPLETO',
  })
  nombre_completo: string;

  @Column('varchar2', {
    length: 1,
    nullable: false,
    name: 'SEXO',
  })
  sexo: string;

  @Column('varchar2', {
    length: 200,
    nullable: true,
    name: 'DIRECCION',
  })
  direccion: string;

  @Column('varchar2', {
    length: 12,
    nullable: true,
    name: 'TELEFONO_DOMICILIO',
  })
  @Check('CHK_TELEFONO_DOMICILIO_NUMEROS', 'REGEXP_LIKE(TELEFONO_DOMICILIO, \'^[0-9]*$\')')
  telefono_domicilio: string;

  @Column('varchar2', {
    length: 12,
    nullable: false,
    name: 'TELEFONO_TRABAJO',
  })
  @Check('CHK_TELEFONO_TRABAJO_NUMEROS', 'REGEXP_LIKE(TELEFONO_TRABAJO, \'^[0-9]*$\')')
  telefono_trabajo: string;

  @Column('varchar2', {
    length: 12,
    nullable: false,
    name: 'TELEFONO_PERSONAL',
  })
  @Check('CHK_TELEFONO_PERSONAL_NUMEROS', 'REGEXP_LIKE(TELEFONO_PERSONAL, \'^[0-9]*$\')')
  telefono_personal: string;

  @Column('varchar2', {
    length: 15,
    nullable: true,
    name: 'N_IDENTIFICACION',
  })
  n_identificacion: string;

  @OneToMany(
    () => Net_Ref_Per_Pers,
    (referenciaPersonalAfiliado) => referenciaPersonalAfiliado.referenciaPersonal,
  )
  referenciasPersonalesAfiliado: Net_Ref_Per_Pers[];
}
