import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";

@Entity({ name: 'MIG_DETALLE_60_RENTAS' })
export class P60Renta {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_DET_60_RENTAS', primaryKeyConstraintName: 'PK_ID_DET_60_RENTAS' })
    id_det_60_rentas: number;

    @Column('varchar2', { length: 20, nullable: false, name: 'DNI',   })
    dni: string;

    @Column('varchar2', { length: 20, nullable: false, name: 'PRIMER_NOMBRE',   })
    primer_nombre: string;

    @Column('varchar2', { length: 20, nullable: false, name: 'SEGUNDO_NOMBRE',   })
    segundo_nombre: string;

    @Column('varchar2', { length: 20, nullable: false, name: 'PRIMER_APELLIDO',   })
    primer_apellido: string;

    @Column('varchar2', { length: 20, nullable: false, name: 'SEGUNDO_APELLIDO',   })
    segundo_apellido: string;

    @Column('varchar2', { length: 20, nullable: false, name: 'ESTATUS',   })
    estatus: string;

    @Column('number', { nullable: true, name: 'LOTE' })
    lote: number;
    
    @Column('varchar2', { length: 20, nullable: false, name: 'TELEFONICO',   })
    telefonico: string;
}
