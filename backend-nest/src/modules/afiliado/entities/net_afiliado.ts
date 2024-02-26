import { Pais } from "src/modules/Regional/pais/entities/pais.entity";
import { Net_TipoIdentificacion } from "src/modules/tipo_identificacion/entities/net_tipo_identificacion.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Provincia } from "src/modules/Regional/provincia/entities/net_provincia.entity";

import { Net_ReferenciaPersonalAfiliado } from "./referenciaP-Afiliado";

import { DetalleDeduccion } from "src/modules/Planilla/detalle-deduccion/entities/detalle-deduccion.entity";
import { Net_perf_afil_cent_trab} from "./net_perf_afil_cent_trab";
import { Net_Detalle_Afiliado } from "./detalle_afiliado.entity";
/* import { DetallePagoBeneficio } from "src/modules/Planilla/detalle_beneficio/entities/detalle_pago_beneficio.entity"; */
import { DetalleBeneficioAfiliado } from "src/modules/Planilla/detalle_beneficio/entities/detalle_beneficio_afiliado.entity";
import { Net_Afiliados_Por_Banco } from "src/modules/banco/entities/net_afiliados-banco";
 
@Entity()
export class Net_Afiliado {

    @PrimaryGeneratedColumn('uuid')
    id_afiliado: string;

    @ManyToOne(() => Net_TipoIdentificacion, tipoIdentificacion => tipoIdentificacion.afiliado, { cascade: true })
    @JoinColumn({ name: 'id_tipo_identificacion' })
    tipoIdentificacion: Net_TipoIdentificacion;

    @ManyToOne(() => Pais, pais => pais.afiliado, { cascade: true })
    @JoinColumn({ name: 'id_pais' })
    pais: Pais;
    
    @Column('varchar2', { length: 40, nullable: true, unique: true })
    dni: string;

    @Column('varchar2', { length: 40, nullable: true })
    estado_civil: string;
    
    @Column('varchar2', { length: 40, nullable: true })
    primer_nombre: string;

    @Column('varchar2', { length: 40, nullable: true })
    segundo_nombre: string;

    @Column('varchar2', { length: 40, nullable: true })
    tercer_nombre: string;

    @Column('varchar2', { length: 40, nullable: true })
    primer_apellido: string;

    @Column('varchar2', { length: 40, nullable: true })
    segundo_apellido: string;

    @Column('char', { length: 1, nullable: true })
    sexo: string;

    @Column('number', { nullable: true })
    cantidad_dependientes: number;

    @Column('number', { nullable: true })
    cantidad_hijos: number;

    @Column('varchar2', { length: 30, nullable: true })
    profesion: string;

    @Column('varchar2', { length: 40, nullable: true })
    representacion: string;

    @Column('varchar2', { length: 12, nullable: true })
    telefono_1: string;

    @Column('varchar2', { length: 12, nullable: true })
    telefono_2: string;

    @Column('varchar2', { length: 40, nullable: true })
    correo_1: string;

    @Column('varchar2', { length: 40, nullable: true })
    correo_2: string;

    @Column('varchar2', { length: 40, nullable: true })
    colegio_magisterial: string;

    @Column('varchar2', { length: 40, nullable: true })
    numero_carnet: string;

    @Column('varchar2', { length: 200, nullable: true })
    direccion_residencia: string;

    @Column('varchar2', { length: 40, default: 'ACTIVO' })
    estado: string;

    @Column('number', { nullable: true})
    salario_base: number;

    @Column('date', { nullable: true })
    fecha_nacimiento: string;

    @Column('varchar2', { length: 200, nullable: true })
    archivo_identificacion: string;

    @OneToMany(() => Net_Detalle_Afiliado, detalleAfiliado => detalleAfiliado.afiliado)
    detalleAfiliado: Net_Detalle_Afiliado[];

    @ManyToOne(() => Net_Provincia, provincia => provincia.afiliado, { cascade: true })
    @JoinColumn({ name: 'id_provincia' })
    provincia: Net_Provincia;
    
    @OneToMany(() => Net_ReferenciaPersonalAfiliado, referenciaPersonalAfiliado => referenciaPersonalAfiliado.afiliado)
    referenciasPersonalAfiliado: Net_ReferenciaPersonalAfiliado[];

    @OneToMany(() => Net_Afiliados_Por_Banco, afiliadosPorBanco => afiliadosPorBanco.afiliado)
    afiliadosPorBanco : Net_Afiliados_Por_Banco[];

    @OneToMany(() => DetalleDeduccion, detalleDeduccion => detalleDeduccion.afiliado)
    detalleDeduccion: DetalleDeduccion[];

    @OneToMany(
        () => Net_perf_afil_cent_trab,
        (perfAfilCentTrab) => perfAfilCentTrab.afiliado,
        { cascade: true })
    perfAfilCentTrabs: Net_perf_afil_cent_trab[];

    @OneToMany(() => DetalleBeneficioAfiliado, detalleBeneficioAfiliado => detalleBeneficioAfiliado.afiliado, { cascade: true })
    detalleBeneficioAfiliado: DetalleBeneficioAfiliado[];

}