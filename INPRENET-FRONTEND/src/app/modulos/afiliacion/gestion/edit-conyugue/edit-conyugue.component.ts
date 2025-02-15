import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AfiliacionService } from 'src/app/services/afiliacion.service';
import { ToastrService } from 'ngx-toastr';
import { PermisosService } from 'src/app/services/permisos.service';
import { BeneficiosService } from '../../../../services/beneficios.service';
import { blockManualInput } from '../../../../shared/functions/form-utils';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-edit-conyugue',
  templateUrl: './edit-conyugue.component.html',
  styleUrls: ['./edit-conyugue.component.scss']
})
export class EditConyugueComponent implements OnChanges {
  formGroup: FormGroup;
  @Input() Afiliado: any;
  conyugeExisteFlag: boolean = false;
  mostrandoFormularioAgregar: boolean = false;
  permisoeditar: boolean = false;
  idFamilia!: number;
  blockManualInput = blockManualInput;

  constructor(
    private fb: FormBuilder,
    private afiliacionService: AfiliacionService,
    private toastr: ToastrService,
    private permisosService: PermisosService,
    private beneficiosService: BeneficiosService,
  ) {
    this.formGroup = this.fb.group({
      conyuge: this.fb.group({
        primer_nombre: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]],
        segundo_nombre: ['', [Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]],
        tercer_nombre: ['', [Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]],
        primer_apellido: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]],
        segundo_apellido: ['', [Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]],
        n_identificacion: [
          '',
          [Validators.required, Validators.pattern('^[0-9]{13}$')]
        ],
        fecha_nacimiento: ['', Validators.required],
        telefono_domicilio: ['', [Validators.pattern('^[0-9]{8,12}$')]],
        telefono_celular: ['', [Validators.required, Validators.pattern('^[0-9]{8,12}$')]],
        telefono_trabajo: ['', [Validators.pattern('^[0-9]{8,12}$')]],
        trabaja: ['NO'],
        es_afiliado: ['NO'],
      })
    });
    this.markAllAsTouched(this.formGroup);
    this.permisoeditar = this.permisosService.userHasPermission('AFILIACIONES', 'afiliacion/buscar-persona', ['editar', 'editarDos','administrar']);
    if (!this.permisoeditar) {
      this.formGroup.disable(); // 🔹 Deshabilita todos los inputs automáticamente
    }

    this.formGroup.get('conyuge.n_identificacion')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(value => {
        if (value && value.length >= 13) {
          this.verificarAfiliado(value);
        } else {
          this.formGroup.patchValue({
            conyuge: { es_afiliado: 'NO' }
          });
        }
      });
  }

  verificarAfiliado(n_identificacion: string): void {
    this.beneficiosService.verificarSiEsAfiliado(n_identificacion).subscribe({
      next: (response: any) => {
        if (response?.esAfiliado?.datosPersona) {
          const datosPersona = response.esAfiliado.datosPersona;

          // Si hay datos de la persona, llenar los campos automáticamente
          this.formGroup.patchValue({
            conyuge: {
              primer_nombre: datosPersona.primer_nombre || '',
              segundo_nombre: datosPersona.segundo_nombre || '',
              tercer_nombre: datosPersona.tercer_nombre || '',
              primer_apellido: datosPersona.primer_apellido || '',
              segundo_apellido: datosPersona.segundo_apellido || '',
              n_identificacion: datosPersona.n_identificacion || n_identificacion,
              fecha_nacimiento: datosPersona.fecha_nacimiento || '',
              telefono_domicilio: datosPersona.telefono_domicilio || '',
              telefono_celular: datosPersona.telefono_celular || '',
              telefono_trabajo: datosPersona.telefono_trabajo || '',
              trabaja: datosPersona.trabaja === 'SI' ? 'SI' : 'NO',
              es_afiliado: response.esAfiliado ? 'SÍ' : 'NO'
            }
          });
        } else {
          // Si no se encuentra, dejar los campos vacíos y marcar como no afiliado
          this.formGroup.patchValue({
            conyuge: {
              es_afiliado: 'NO',
              primer_nombre: '',
              segundo_nombre: '',
              tercer_nombre: '',
              primer_apellido: '',
              segundo_apellido: '',
              fecha_nacimiento: '',
              telefono_domicilio: '',
              telefono_celular: '',
              telefono_trabajo: '',
              trabaja: 'NO'
            }
          });
        }
      },
      error: (error) => {
        console.error('Error al verificar afiliado:', error);
        this.formGroup.patchValue({
          conyuge: { es_afiliado: 'NO' }
        });
      }
    });
}


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['Afiliado'] && this.Afiliado && this.Afiliado.n_identificacion) {
      this.cargarConyuge(this.Afiliado.n_identificacion);
    }
  }

  cargarConyuge(n_identificacion: string): void {
    this.afiliacionService.obtenerConyugePorIdentificacion(n_identificacion).subscribe({
      next: (conyuge) => {
        if (!conyuge || !conyuge.id_familia) {
          this.conyugeExisteFlag = false;
          this.mostrandoFormularioAgregar = true;
          return;
        }
  
        this.conyugeExisteFlag = true;
        this.mostrandoFormularioAgregar = false;
        this.idFamilia = conyuge.id_familia;
  
        let fecha_nacimiento = conyuge.fecha_nacimiento ? this.convertToLocalDate(conyuge.fecha_nacimiento) : null;
  
        this.formGroup.patchValue({
          conyuge: {
            primer_nombre: conyuge.primer_nombre,
            segundo_nombre: conyuge.segundo_nombre,
            tercer_nombre: conyuge.tercer_nombre,
            primer_apellido: conyuge.primer_apellido,
            segundo_apellido: conyuge.segundo_apellido,
            n_identificacion: conyuge.n_identificacion,
            fecha_nacimiento: fecha_nacimiento,
            telefono_domicilio: conyuge.telefono_3,
            telefono_celular: conyuge.telefono_1,
            telefono_trabajo: conyuge.telefono_2,
            trabaja: conyuge.trabaja === 'SI' ? 'SI' : 'NO',
            es_afiliado: conyuge.esAfiliado === 'SÍ' ? 'SÍ' : 'NO'
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar la información del cónyuge', error);
        this.conyugeExisteFlag = false;
      }
    });
  }
  

  private markAllAsTouched(control: FormGroup): void {
    Object.keys(control.controls).forEach(field => {
      const controlField = control.get(field);
      controlField?.markAsTouched();
      controlField?.markAsDirty(); // También marcarlo como "modificado"
      if (controlField instanceof FormGroup) {
        this.markAllAsTouched(controlField);
      }
    });
  }

  agregarConyuge() {
    const datosConyuge = this.formGroup.get('conyuge')?.value;
  
    const formattedData = [
      {
        parentesco: 'CÓNYUGE',
        persona_referencia: {
          primer_nombre: datosConyuge.primer_nombre,
          segundo_nombre: datosConyuge.segundo_nombre,
          tercer_nombre: datosConyuge.tercer_nombre,
          primer_apellido: datosConyuge.primer_apellido,
          segundo_apellido: datosConyuge.segundo_apellido,
          n_identificacion: datosConyuge.n_identificacion,
          fecha_nacimiento: datosConyuge.fecha_nacimiento instanceof Date
            ? datosConyuge.fecha_nacimiento.toISOString().split('T')[0]
            : datosConyuge.fecha_nacimiento,
          telefono_3: datosConyuge.telefono_domicilio,
          telefono_1: datosConyuge.telefono_celular,
          telefono_2: datosConyuge.telefono_trabajo,
        }
      }
    ];
  
    this.afiliacionService.crearFamilia(this.Afiliado.id_persona, formattedData)
      .subscribe({
        next: () => {
          this.toastr.success('Cónyuge agregado correctamente');
          this.conyugeExisteFlag = true;
          this.mostrandoFormularioAgregar = false;
          this.cargarConyuge(this.Afiliado.n_identificacion);
        },
        error: (error) => {
          this.toastr.error('Error al agregar el cónyuge');
          console.error('Error:', error);
        }
      });
  }

  actualizarConyuge() {
    const datosConyuge = this.formGroup.get('conyuge')?.value;
    this.afiliacionService.actualizarConyuge(this.Afiliado.n_identificacion, datosConyuge)
      .subscribe(
        response => {
          this.toastr.success('Datos del cónyuge actualizados correctamente');
        },
        error => {
          this.toastr.error('Error al actualizar los datos del cónyuge');
        }
      );
  }

  eliminarConyuge() {
    const idPersona = this.Afiliado.id_persona;
    if (idPersona && this.idFamilia) {
      this.afiliacionService.eliminarFamiliar(idPersona, this.idFamilia).subscribe({
        next: () => {
          this.toastr.success('Cónyuge eliminado correctamente');
          
          // 🔹 Restablecer estados para mostrar el formulario de agregar
          this.conyugeExisteFlag = false;
          this.mostrandoFormularioAgregar = true; // 🔥 Esto asegura que el formulario aparezca
  
          // 🔹 Reiniciar el formulario
          this.formGroup.reset();
          this.formGroup.patchValue({
            conyuge: {
              primer_nombre: '',
              segundo_nombre: '',
              tercer_nombre: '',
              primer_apellido: '',
              segundo_apellido: '',
              n_identificacion: '',
              fecha_nacimiento: '',
              telefono_domicilio: '',
              telefono_celular: '',
              telefono_trabajo: '',
              trabaja: 'NO',
              es_afiliado: 'NO'
            }
          });
        },
        error: () => {
          this.toastr.error('Error al eliminar el cónyuge');
        }
      });
    }
  }
  

  convertToLocalDate(fechaISO: string): Date {
    const date = new Date(fechaISO);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  }
}
