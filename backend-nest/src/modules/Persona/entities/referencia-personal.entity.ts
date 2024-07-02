import { Check, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Net_Ref_Per_Pers } from './net_ref-per-persona.entity';

@Entity({ name: 'NET_REFERENCIA_PERSONAL' })
@Check('CHECK_SEXO', `SEXO IN ('F', 'M')`)
@Check('CHECK_DISCAPACIDAD', `DISCAPACIDAD IN ('MOTRIZ', 'AUDITIVA', 'VISUAL', 'INTELECTUAL', 'MENTAL', 'PSICOSOCIAL', 'MÚLTIPLE', 'SENSORIAL')`)
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
    name: 'PRIMER_NOMBRE',
  })
  @Check('CHK_PRIMER_NOMBRE_SIN_NUMEROS', `REGEXP_LIKE(PRIMER_NOMBRE, '^[^0-9]*$')`)
  primer_nombre: string;

  @Column('varchar2', {
    length: 50,
    nullable: true,
    name: 'SEGUNDO_NOMBRE',
  })
  @Check('CHK_SEGUNDO_NOMBRE_SIN_NUMEROS', `REGEXP_LIKE(SEGUNDO_NOMBRE, '^[^0-9]*$')`)
  segundo_nombre: string;

  @Column('varchar2', {
    length: 50,
    nullable: true,
    name: 'TERCER_NOMBRE',
  })
  @Check('CHK_TERCER_NOMBRE_SIN_NUMEROS', `REGEXP_LIKE(TERCER_NOMBRE, '^[^0-9]*$')`)
  tercer_nombre: string;

  @Column('varchar2', {
    length: 50,
    nullable: false,
    name: 'PRIMER_APELLIDO',
  })
  @Check('CHK_PRIMER_APELLIDO_SIN_NUMEROS', `REGEXP_LIKE(PRIMER_APELLIDO, '^[^0-9]*$')`)
  primer_apellido: string;

  @Column('varchar2', {
    length: 50,
    nullable: true,
    name: 'SEGUNDO_APELLIDO',
  })
  @Check('CHK_SEGUNDO_APELLIDO_SIN_NUMEROS', `REGEXP_LIKE(SEGUNDO_APELLIDO, '^[^0-9]*$')`)
  segundo_apellido: string;

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
  @Check('CHK_TELEFONO_DOMICILIO_NUMEROS', `REGEXP_LIKE(TELEFONO_DOMICILIO, '^[0-9]*$')`)
  telefono_domicilio: string;

  @Column('varchar2', {
    length: 12,
    nullable: false,
    name: 'TELEFONO_TRABAJO',
  })
  @Check('CHK_TELEFONO_TRABAJO_NUMEROS', `REGEXP_LIKE(TELEFONO_TRABAJO, '^[0-9]*$')`)
  telefono_trabajo: string;

  @Column('varchar2', {
    length: 12,
    nullable: false,
    name: 'TELEFONO_PERSONAL',
  })
  @Check('CHK_TELEFONO_PERSONAL_NUMEROS', `REGEXP_LIKE(TELEFONO_PERSONAL, '^[0-9]*$')`)
  telefono_personal: string;

  @Column('varchar2', {
    length: 15,
    nullable: true,
    name: 'N_IDENTIFICACION',
  })
  n_identificacion: string;

  @Column('varchar2', {
    length: 50,
    nullable: false,
    name: 'TIPO_IDENTIFICACION',
  })
  tipo_identificacion: string;

  @Column('varchar2', {
    length: 50,
    nullable: true,
    name: 'PROFESION',
  })
  @Check('CHK_PROFESION_SIN_NUMEROS', `REGEXP_LIKE(PROFESION, '^[^0-9]*$')`)
  profesion: string;

  @Column('varchar2', {
    length: 20,
    nullable: true,
    name: 'DISCAPACIDAD',
  })
  discapacidad: string;

  @Column('date', {
    nullable: true,
    name: 'FECHA_NACIMIENTO',
  })
  fecha_nacimiento: Date;

  @OneToMany(
    () => Net_Ref_Per_Pers,
    (referenciaPersonalAfiliado) => referenciaPersonalAfiliado.referenciaPersonal,
  )
  referenciasPersonalesAfiliado: Net_Ref_Per_Pers[];
}
