import { net_persona } from "src/modules/Persona/entities/net_persona.entity";
import { Net_Deduccion } from "src/modules/Planilla/deduccion/entities/net_deduccion.entity";
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";

@Entity({ name: "NET_DETALLE_PRESTAMO" })
export class Net_Detalle_Prestamo {
    @PrimaryGeneratedColumn({ 
        type: "int", 
        name: "ID_DETALLE_PRESTAMO", 
        primaryKeyConstraintName: "PK_ID_DETALLE_PRESTAMO" 
    })
    id: number;

    @Column({ type: "int", name: "ANIO", nullable: false })
    anio: number;

    @Column({ type: "int", name: "MES", nullable: false })
    mes: number;

    @Column({ type: "varchar", name: "N_PRESTAMO", length: 50, nullable: false }) // Cambié 'varchar2' a 'varchar' para mayor compatibilidad
    n_prestamo: string;

    @Column({ type: "decimal", name: "VALOR", precision: 10, scale: 2, nullable: false })
    valor: number;

    @Column({ type: "varchar", name: "ESTADO", length: 20, nullable: false })
    estado: string;

    @ManyToOne(() => Net_Deduccion, deduccion => deduccion.detallePrestamos, { nullable: false })
    @JoinColumn({ name: "ID_DEDUCCION", foreignKeyConstraintName: "FK_ID_DEDUCCION_DETALLE_PRESTAMO" })
    deduccion: Net_Deduccion;

    @ManyToOne(() => net_persona, persona => persona.detallePrestamos, { nullable: false })
    @JoinColumn({ name: "ID_PERSONA", foreignKeyConstraintName: "FK_ID_PERSONA_DETALLE_PRESTAMO" })
    persona: net_persona;
}
