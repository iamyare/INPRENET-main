import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Net_Cuenta_Persona } from "./net_cuenta_persona.entity";
import { Net_Planilla } from "src/modules/Planilla/planilla/entities/net_planilla.entity";
import { Net_Centro_Trabajo } from "src/modules/Empresarial/entities/net_centro_trabajo.entity";

@Entity({ name: "NET_COTIZACION_APORTACION" })
export class Net_Cotizacion_Aportacion {
    @PrimaryGeneratedColumn({ name: "ID_COTIZACION_APORTACION" })
    id_cotizacion_aportacion: number;

    @ManyToOne(() => Net_Centro_Trabajo, centro => centro.id_centro_trabajo)
    @JoinColumn({ name: "ID_CENTRO_TRABAJO" })
    centroTrabajo: Net_Centro_Trabajo;

    @ManyToOne(() => Net_Cuenta_Persona, cuenta => cuenta.id_cuenta_persona)
    @JoinColumn({ name: "ID_CUENTA_COTIZACION" })
    cuentaCotizacion: Net_Cuenta_Persona;

    @ManyToOne(() => Net_Cuenta_Persona, cuenta => cuenta.id_cuenta_persona)
    @JoinColumn({ name: "ID_CUENTA_APORTACION" })
    cuentaAportacion: Net_Cuenta_Persona;

    @ManyToOne(() => Net_Planilla, planilla => planilla.id_planilla)
    @JoinColumn({ name: "ID_PLANILLA" })
    planilla: Net_Planilla;

    @Column({ type: "decimal", precision: 10, scale: 2, name: "MONTO_COTIZACION" })
    montoCotizacion: number;

    @Column({ type: "decimal", precision: 10, scale: 2, name: "MONTO_APORTACION" })
    montoAportacion: number;

    @Column({ type: "decimal", precision: 10, scale: 2, name: "SUELDO" })
    sueldo: number;

    @Column({ type: "varchar", length: 20, name: "ESTADO" })
    estado: string;
}
