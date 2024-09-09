import { Component, ViewChild, TemplateRef, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { BenefComponent } from '../benef/benef.component';
import { DatosGeneralesComponent } from '../datos-generales/datos-generales.component';
import { AfiliacionService } from 'src/app/services/afiliacion.service'; // Asegúrate de importar tu servicio
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-afiliar-docente',
  templateUrl: './afiliar-docente.component.html',
  styleUrls: ['./afiliar-docente.component.scss']
})
export class AfiliarDocenteComponent implements OnInit {

  @ViewChild('datosGeneralesTemplate', { static: true }) datosGeneralesTemplate!: TemplateRef<any>;
  @ViewChild('referenciasPersonalesTemplate', { static: true }) referenciasPersonalesTemplate!: TemplateRef<any>;
  @ViewChild('colegiosMagisterialesTemplate', { static: true }) colegiosMagisterialesTemplate!: TemplateRef<any>;
  @ViewChild('bancosTemplate', { static: true }) bancosTemplate!: TemplateRef<any>;
  @ViewChild('centrosTrabajoTemplate', { static: true }) centrosTrabajoTemplate!: TemplateRef<any>;
  @ViewChild('beneficiariosTemplate', { static: true }) beneficiariosTemplate!: TemplateRef<any>;
  @ViewChild(MatStepper) stepper!: MatStepper;

  steps: any[] = [];
  formGroup!: FormGroup;
  fotoPerfil: string = '';

  constructor(private fb: FormBuilder, private afiliacionService: AfiliacionService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({});

    this.steps = [
      {
        label: 'Datos Generales',
        formGroup: this.fb.group({
          peps: this.fb.array([]),
          familiares: this.fb.array([])
        }),
        template: this.datosGeneralesTemplate
      },
      {
        label: 'Referencias Personales',
        formGroup: this.fb.group({}),
        template: this.referenciasPersonalesTemplate
      },
      {
        label: 'Colegios Magisteriales',
        formGroup: this.fb.group({}),
        template: this.colegiosMagisterialesTemplate
      },
      {
        label: 'Cuentas Bancarias',
        formGroup: this.fb.group({}),
        template: this.bancosTemplate
      },
      {
        label: 'Centros de Trabajo y Otras Fuentes de Ingreso',
        formGroup: this.fb.group({}),
        template: this.centrosTrabajoTemplate
      },
      {
        label: 'Beneficiarios',
        formGroup: this.fb.group({}),
        template: this.beneficiariosTemplate
      }
    ];

    // Asignar los subformularios al formGroup principal
    this.formGroup.addControl('datosGenerales', this.steps[0].formGroup);
    this.formGroup.addControl('referenciasPersonales', this.steps[1].formGroup);
    this.formGroup.addControl('colegiosMagisteriales', this.steps[2].formGroup);
    this.formGroup.addControl('bancos', this.steps[3].formGroup);
    this.formGroup.addControl('centrosTrabajo', this.steps[4].formGroup);
    this.formGroup.addControl('beneficiarios', this.steps[5].formGroup);
  }

  // Método para marcar todos los campos de un FormGroup o FormArray como tocados
  markAllAsTouched(control: FormGroup | FormArray): void {
    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.values(control.controls).forEach(ctrl => {
        ctrl.markAsTouched();
        if (ctrl instanceof FormGroup || ctrl instanceof FormArray) {
          this.markAllAsTouched(ctrl);
        }
      });
    }
  }

  isStepInvalid(formGroup: FormGroup): boolean {
    return formGroup.invalid && (formGroup.touched || formGroup.dirty);
  }

  onSubmit(): void {
    if (this.formGroup.valid) {
      const datosGenerales = this.formGroup.get('datosGenerales')?.value;
      const referenciasPersonales = this.formGroup.get('referenciasPersonales')?.value;
      const colegiosMagisteriales = this.formGroup.get('colegiosMagisteriales')?.value;
      const bancos = this.formGroup.get('bancos')?.value;
      const centrosTrabajo = this.formGroup.get('centrosTrabajo')?.value;
      const beneficiarios = this.formGroup.get('beneficiarios')?.value;

      console.log(datosGenerales);


      const formattedData = {
        persona: {
          id_tipo_identificacion: datosGenerales.id_tipo_identificacion,
          id_pais_nacionalidad: datosGenerales.id_pais,
          n_identificacion: datosGenerales.n_identificacion,
          fecha_vencimiento_ident: datosGenerales.fecha_vencimiento_ident,
          rtn: datosGenerales.rtn,
          grupo_etnico: datosGenerales.grupo_etnico,
          estado_civil: datosGenerales.estado_civil,
          primer_nombre: datosGenerales.primer_nombre,
          segundo_nombre: datosGenerales.segundo_nombre,
          tercer_nombre: datosGenerales.tercer_nombre,
          primer_apellido: datosGenerales.primer_apellido,
          segundo_apellido: datosGenerales.segundo_apellido,
          genero: datosGenerales.genero,
          cantidad_hijos: datosGenerales.cantidad_hijos,
          representacion: datosGenerales.representacion,
          grado_academico: datosGenerales.grado_academico,
          telefono_1: datosGenerales.telefono_1,
          telefono_2: datosGenerales.telefono_2,
          correo_1: datosGenerales.correo_1,
          correo_2: datosGenerales.correo_2,
          fecha_nacimiento: datosGenerales.fecha_nacimiento,
          direccion_residencia: this.formatDireccion(datosGenerales),
          id_municipio_residencia: datosGenerales.id_municipio_residencia,
          id_municipio_nacimiento: datosGenerales.id_municipio_nacimiento,
          id_profesion: datosGenerales.id_profesion,
          discapacidades: this.formatDiscapacidades(datosGenerales.discapacidades) || []
        },
        familiares: this.formatFamiliares(datosGenerales, referenciasPersonales),
        peps: this.formatPeps(datosGenerales.peps || []),
        detallePersona: {
          eliminado: "NO",
          tipo_persona: "AFILIADO",
          nombre_estado: "ACTIVO"
        },
        colegiosMagisteriales: this.formatColegiosMagisteriales(colegiosMagisteriales.ColMags || []),
        bancos: this.formatBancos(bancos.bancos || []),
        centrosTrabajo: this.formatCentrosTrabajo(centrosTrabajo.trabajo || []),
        otrasFuentesIngreso: this.formatOtrasFuentesIngreso(centrosTrabajo.otrasFuentesIngreso || []),
        referencias: this.formatReferencias(referenciasPersonales.refpers || []),
        beneficiarios: this.formatBeneficiarios(beneficiarios.beneficiario || []),
      };

      const fotoPerfilBase64 = this.fotoPerfil || '';
    let file: any;

    if (fotoPerfilBase64) {
      const fotoBlob = this.dataURItoBlob(fotoPerfilBase64);
      file = new File([fotoBlob], 'perfil.jpg', { type: 'image/jpeg' });
    }

    console.log(formattedData);

    this.afiliacionService.crearAfiliacion(formattedData, file).subscribe(
      response => {
        console.log('Datos enviados con éxito:', response);
        this.toastr.success('Datos enviados con éxito', 'Éxito');
        this.resetForm();
      },
      error => {
        console.error('Error al enviar los datos:', error);
        const errorMessage = error.error?.mensaje || 'Hubo un error al enviar los datos';
        this.toastr.error(errorMessage, 'Error');
      }
    );
  } else {
    this.markAllAsTouched(this.formGroup);
    this.toastr.warning('El formulario contiene información inválida', 'Advertencia');
    console.log('El formulario no es válido');
  }
  }

  private formatDireccion(datosGenerales: any): string {
    return [
      datosGenerales.avenida,
      datosGenerales.calle,
      datosGenerales.sector,
      datosGenerales.bloque,
      datosGenerales.numero_casa,
      datosGenerales.color_casa,
      datosGenerales.aldea,
      datosGenerales.caserio,
    ].filter(Boolean).join(', ');
  }

  private formatPeps(peps: any[]): any[] {
    return peps.map(pep => ({
      cargosPublicos: [
        {
          cargo: pep.pep_cargo_desempenado || '',
          fecha_inicio: pep.startDate || '',
          fecha_fin: pep.endDate || ''
        }
      ]
    }));
  }


  private formatColegiosMagisteriales(colMags: any[]): any[] {
    return colMags.map(col => ({
      id_colegio: col.id_colegio
    }));
  }

  private formatBancos(bancos: any[]): any[] {
    return bancos.map(banco => ({
      id_banco: banco.id_banco,
      num_cuenta: banco.num_cuenta,
      estado: banco.estado
    }));
  }

  private formatCentrosTrabajo(trabajos: any[]): any[] {
    return trabajos.map(trabajo => ({
      id_centro_trabajo: trabajo.id_centro_trabajo,
      cargo: trabajo.cargo,
      numero_acuerdo: trabajo.numero_acuerdo,
      salario_base: trabajo.salario_base,
      fecha_ingreso: trabajo.fecha_ingreso,
      fecha_egreso: trabajo.fecha_egreso,
      estado: trabajo.estado,
      jornada: trabajo.jornada,
      tipo_jornada: trabajo.tipo_jornada
    }));
  }

  private formatOtrasFuentesIngreso(otrasFuentesIngreso: any[]): any[] {
    return otrasFuentesIngreso.map(fuente => ({
      actividad_economica: fuente.actividad_economica,
      monto_ingreso: fuente.monto_ingreso,
      observacion: fuente.observacion
    }));
  }

  private formatReferencias(refpers: any[]): any[] {
    return refpers.map(referencia => ({
        tipo_referencia: referencia.tipo_referencia,
        parentesco: referencia.parentesco,
        primer_nombre: referencia.primer_nombre,
        segundo_nombre: referencia.segundo_nombre,
        tercer_nombre: referencia.tercer_nombre,
        primer_apellido: referencia.primer_apellido,
        segundo_apellido: referencia.segundo_apellido,
        telefono_domicilio: referencia.telefono_domicilio,
        telefono_trabajo: referencia.telefono_trabajo,
        telefono_personal: referencia.telefono_personal,
        n_identificacion: referencia.n_identificacion,
        direccion: referencia.direccion,
    }));
  }

  private formatBeneficiarios(beneficiarios: any[]): any[] {
    return beneficiarios.map(beneficiario => ({
      persona: {
        n_identificacion: beneficiario.n_identificacion,
        primer_nombre: beneficiario.primer_nombre,
        segundo_nombre: beneficiario.segundo_nombre,
        tercer_nombre: beneficiario.tercer_nombre,
        primer_apellido: beneficiario.primer_apellido,
        segundo_apellido: beneficiario.segundo_apellido,
        telefono_1: beneficiario.telefono_1,
        fecha_nacimiento: beneficiario.fecha_nacimiento,
        direccion_residencia: beneficiario.direccion_residencia,
        id_municipio_residencia: beneficiario.id_municipio_residencia,
        id_municipio_nacimiento: beneficiario.id_municipio_nacimiento
      },
      discapacidades: beneficiario.discapacidades,
      porcentaje: beneficiario.porcentaje || null
    }));
  }

  private formatFamiliares(datosGenerales: any, referenciasPersonales: any): any[] {
    const familiares = datosGenerales.familiares || [];
    return [
      ...familiares.map((familiar: any) => ({
        parentesco: familiar.parentesco,
        persona_referencia: {
          primer_nombre: familiar.primer_nombre,
          segundo_nombre: familiar.segundo_nombre,
          tercer_nombre: familiar.tercer_nombre,
          primer_apellido: familiar.primer_apellido,
          segundo_apellido: familiar.segundo_apellido,
          telefono_domicilio: familiar.telefono_domicilio,
          telefono_trabajo: familiar.telefono_trabajo,
          telefono_personal: familiar.telefono_personal,
          n_identificacion: familiar.n_identificacion,
          fecha_nacimiento: familiar.fecha_nacimiento
        }
      })),
      ...(referenciasPersonales.conyuge && referenciasPersonales.conyuge.primer_nombre ? [{
        parentesco: "CÓNYUGUE",
        persona_referencia: {
          primer_nombre: referenciasPersonales.conyuge.primer_nombre,
          segundo_nombre: referenciasPersonales.conyuge.segundo_nombre,
          tercer_nombre: referenciasPersonales.conyuge.tercer_nombre,
          primer_apellido: referenciasPersonales.conyuge.primer_apellido,
          segundo_apellido: referenciasPersonales.conyuge.segundo_apellido,
          telefono_domicilio: referenciasPersonales.conyuge.telefono_domicilio,
          telefono_trabajo: referenciasPersonales.conyuge.telefono_trabajo,
          telefono_personal: referenciasPersonales.conyuge.telefono_celular,
          n_identificacion: referenciasPersonales.conyuge.n_identificacion,
          fecha_nacimiento: referenciasPersonales.conyuge.fecha_nacimiento
        }
      }] : [])
    ];
  }

  dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    const buffer = new ArrayBuffer(byteString.length);
    const data = new DataView(buffer);

    for (let i = 0; i < byteString.length; i++) {
      data.setUint8(i, byteString.charCodeAt(i));
    }

    return new Blob([buffer], { type: mimeString });
  }

  handleImageCaptured(image: string): void {
    this.fotoPerfil = image;
}

resetForm(): void {
  this.formGroup.reset();
  this.steps.forEach(step => {
    step.formGroup.reset();
  });
  this.fotoPerfil = '';
  this.stepper.reset();
}

formatDiscapacidades(discapacidades: any): any[] {
  // Filtra solo las discapacidades que están en 'true' y formatea el resultado
  return Object.keys(discapacidades)
    .filter(key => discapacidades[key]) // Filtra las discapacidades activas
    .map(key => ({ tipo_discapacidad: key })); // Mapea al formato deseado
}


}
