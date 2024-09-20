import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AfiliacionService } from 'src/app/services/afiliacion.service';
import { ToastrService } from 'ngx-toastr';

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

  constructor(
    private fb: FormBuilder,
    private afiliacionService: AfiliacionService,
    private toastr: ToastrService
  ) {
    this.formGroup = this.fb.group({
      conyuge: this.fb.group({
        primer_nombre: ['', Validators.required],
        segundo_nombre: [''],
        tercer_nombre: [''],
        primer_apellido: ['', Validators.required],
        segundo_apellido: [''],
        n_identificacion: ['', Validators.required],
        fecha_nacimiento: ['', Validators.required],
        telefono_domicilio: ['', [Validators.pattern('^[0-9]*$')]],
        telefono_celular: ['', [Validators.pattern('^[0-9]*$')]],
        telefono_trabajo: ['', [Validators.pattern('^[0-9]*$')]],
        trabaja: ['NO'],
        es_afiliado: ['NO'],
      })
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
        if (conyuge) {
          this.conyugeExisteFlag = true;
          this.mostrandoFormularioAgregar = false;
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
              telefono_domicilio: conyuge.telefono_1,
              telefono_celular: conyuge.telefono_2,
              telefono_trabajo: conyuge.telefono_3,
              trabaja: conyuge.trabaja === 'SI' ? 'SI' : 'NO',
              es_afiliado: conyuge.esAfiliado === 'SI' ? 'SI' : 'NO'
            }
          });
        } else {
          this.conyugeExisteFlag = false;
        }
      },
      error: (error) => {
        this.toastr.error('Error al cargar los datos del cónyuge');
        console.error('Error al cargar la información del cónyuge', error);
      }
    });
  }

  mostrarFormularioAgregar() {
    this.mostrandoFormularioAgregar = true;
  }

  agregarConyuge() {
    const datosConyuge = this.formGroup.get('conyuge')?.value;

    const formattedData = [
      {
        parentesco: 'CÓNYUGUE',
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
          telefono_domicilio: datosConyuge.telefono_domicilio,
          telefono_celular: datosConyuge.telefono_celular,
          telefono_trabajo: datosConyuge.telefono_trabajo,
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

  convertToLocalDate(fechaISO: string): Date {
    const date = new Date(fechaISO);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  }
}
