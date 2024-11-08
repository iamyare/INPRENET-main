import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AfiliacionService } from 'src/app/services/afiliacion.service';
import { ToastrService } from 'ngx-toastr';
import { PermisosService } from 'src/app/services/permisos.service';

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
  mostrarBotonAgregar: boolean = false;
  idFamilia!: number;

  constructor(
    private fb: FormBuilder,
    private afiliacionService: AfiliacionService,
    private toastr: ToastrService,
    private permisosService: PermisosService
  ) {
    this.formGroup = this.fb.group({
      conyuge: this.fb.group({
        primer_nombre: ['', Validators.required],
        segundo_nombre: [''],
        tercer_nombre: [''],
        primer_apellido: ['', Validators.required],
        segundo_apellido: [''],
        n_identificacion: [
          '',
          [Validators.required, Validators.pattern('^[0-9]{13,15}$')]
        ],
        fecha_nacimiento: ['', Validators.required],
        telefono_domicilio: ['', [Validators.pattern('^[0-9]{8,12}$')]],
        telefono_celular: ['', [Validators.required, Validators.pattern('^[0-9]{8,12}$')]],
        telefono_trabajo: ['', [Validators.pattern('^[0-9]{8,12}$')]],
        trabaja: ['NO'],
        es_afiliado: ['NO'],
      })
    });
    this.mostrarBotonAgregar = this.permisosService.userHasPermission('AFILIACIÓN', 'afiliacion/buscar-persona', 'editar');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['Afiliado'] && this.Afiliado && this.Afiliado.n_identificacion) {
      this.cargarConyuge(this.Afiliado.n_identificacion);
    }
  }

  cargarConyuge(n_identificacion: string): void {
    this.afiliacionService.obtenerConyugePorIdentificacion(n_identificacion).subscribe({
      next: (conyuge) => {
        if (conyuge) {
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
              es_afiliado: conyuge.esAfiliado === 'SI' ? 'SI' : 'NO'
            }
          });
        } else {
          this.conyugeExisteFlag = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar la información del cónyuge', error);
      }
    });
  }

  mostrarFormularioAgregar() {
    this.mostrandoFormularioAgregar = true;
    this.markAllAsTouched(this.formGroup.get('conyuge') as FormGroup);
  }

  private markAllAsTouched(control: FormGroup): void {
    Object.keys(control.controls).forEach(field => {
      const controlField = control.get(field);
      controlField?.markAsTouched();
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
      .subscribe(
        response => {
          this.toastr.success('Cónyuge agregado correctamente');
          this.conyugeExisteFlag = true;
          this.mostrandoFormularioAgregar = false;
        },
        error => {
          this.toastr.error('Error al agregar el cónyuge');
          console.error('Error:', error);
        }
      );
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
          this.conyugeExisteFlag = false;
          this.formGroup.reset();
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
