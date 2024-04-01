
import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Detalle_Afiliado } from "src/modules/afiliado/entities/Net_detalle_persona.entity";
import { Net_Persona } from "src/modules/afiliado/entities/Net_Persona";
import { Net_Centro_Trabajo } from "src/modules/Empresarial/centro-trabajo/entities/net_centro-trabajo.entity";

@Entity({ name: 'NET_SALARIO_COTIZABLE' })
@Check("CK_TIPO_SALAR_COTIZANTE", `TIPO IN ('P', 'M')`)
export class Net_SALARIO_COTIZABLE {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_SALARIO_COTIZABLE', primaryKeyConstraintName: 'PK_ID_SALARIO_COTIZABLE' })
    id_salario_cotizable: number;

    @Column({ type: 'varchar2', nullable: false, name: 'NOMBRE' })
    nombre: string;

    @Column({ type: 'decimal', precision: 10, scale: 4, nullable: false, name: 'VALOR' })
    valor: number;

    @Column({ type: 'varchar2', nullable: false, name: 'TIPO' })
    tipo: string;

    @Column({ type: 'varchar2', nullable: true, name: 'DESCRIPCION' })
    descripcion: string;

}