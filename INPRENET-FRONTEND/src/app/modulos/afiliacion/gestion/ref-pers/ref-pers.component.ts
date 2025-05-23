import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { BeneficiosService } from 'src/app/services/beneficios.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

@Component({
  selector: 'app-ref-pers',
  templateUrl: './ref-pers.component.html',
  styleUrls: ['./ref-pers.component.scss']
})
export class RefPersComponent implements OnInit {
  @Input() formGroup!: FormGroup;

  public parentesco: any[] = [];
  public tipo_referencia: any[] = [];

  esAfiliadoText: string = '';

  constructor(
    private fb: FormBuilder,
    private datosEstaticosService: DatosEstaticosService,
    private beneficiosService: BeneficiosService
  ) {}

  ngOnInit(): void {
    if (!this.formGroup.get('conyuge')) {
      this.formGroup.addControl('conyuge', this.initFormConyuge());
    }
    if (!this.formGroup.get('refpers')) {
      this.formGroup.addControl('refpers', this.fb.array([]));
    }
    this.cargarDatosEstaticos();
  }

  verificarAfiliadoBlur(): void {
    const nIdentificacionControl = this.formGroup.get('conyuge')?.get('n_identificacion');
    const n_identificacion = nIdentificacionControl?.value;

    if (n_identificacion) {
      this.verificarAfiliado(n_identificacion);
    } else {
      this.esAfiliadoText = 'NO';
    }
  }

  get referencias(): FormArray {
    return this.formGroup.get('refpers') as FormArray;
  }

  // Función para inicializar el FormGroup de cónyuge
  private initFormConyuge(): FormGroup {
    return this.fb.group({
      primer_nombre: ['', []],
      segundo_nombre: [''],
      tercer_nombre: [''],
      primer_apellido: ['', []],
      segundo_apellido: [''],
      n_identificacion: ['', []],
      fecha_nacimiento: ['', []],
      telefono_domicilio: ['', []],
      telefono_celular: ['', []],
      telefono_trabajo: [''],
      trabaja: ['', []],
      es_afiliado: ['', []]
    });
  }

  verificarAfiliado(n_identificacion: string): void {
    this.beneficiosService.verificarSiEsAfiliado(n_identificacion).subscribe({
      next: (esAfiliado) => {
        this.esAfiliadoText = esAfiliado ? 'SÍ' : 'NO'; // Asigna el texto
      },
      error: (error) => {
        this.esAfiliadoText = 'NO'; // Maneja el error como 'NO'
        console.error('Error al verificar si es afiliado', error); // Log para depuración
      }
    });
  }

  // Función para agregar una nueva referencia personal
  agregarReferencia(datos?: any): void {
    const referenciaForm = this.fb.group({
      tipo_referencia: [datos?.tipo_referencia || '', [Validators.required]],
      primer_nombre: [datos?.primer_nombre || '', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[^0-9]*$/)]],
      segundo_nombre: [datos?.segundo_nombre || '', [Validators.maxLength(50), Validators.pattern(/^[^0-9]*$/)]],
      tercer_nombre: [datos?.tercer_nombre || '', [Validators.maxLength(50), Validators.pattern(/^[^0-9]*$/)]],
      primer_apellido: [datos?.primer_apellido || '', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[^0-9]*$/)]],
      segundo_apellido: [datos?.segundo_apellido || '', [Validators.maxLength(50), Validators.pattern(/^[^0-9]*$/)]],
      direccion: [datos?.direccion || '', [Validators.maxLength(200)]],
      telefono_domicilio: [datos?.telefono_domicilio || '', [Validators.minLength(8), Validators.maxLength(12), Validators.pattern(/^[0-9]*$/)]],
      telefono_trabajo: [datos?.telefono_trabajo || '', [Validators.minLength(8), Validators.maxLength(12), Validators.pattern(/^[0-9]*$/)]],
      telefono_personal: [datos?.telefono_personal || '', [Validators.minLength(8), Validators.maxLength(12), Validators.pattern(/^[0-9]*$/)]],
      parentesco: [datos?.parentesco || '', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      n_identificacion: ['', []],
    });
    this.referencias.push(referenciaForm);
    this.markAllAsTouched(referenciaForm);
  }

  // Función para eliminar una referencia personal
  eliminarReferencia(index: number): void {
    if (this.referencias.length > 0) {
      this.referencias.removeAt(index);
    }
  }

  // Cargar datos estáticos (parentesco, sexo, tipo_referencia, tipo_identificacion)
  private cargarDatosEstaticos(): void {
    this.parentesco = this.datosEstaticosService.parentesco;
    this.tipo_referencia = [
      { label: "REFERENCIA PERSONAL", value: "REFERENCIA PERSONAL" },
      { label: "REFERENCIA FAMILIAR", value: "REFERENCIA FAMILIAR" }
    ];
  }

  // Función para marcar todos los controles como "tocados"
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

  // Obtener errores para un control específico
  getErrors(index: number, controlName: string): string[] {
    const control = (this.referencias.at(index) as FormGroup).get(controlName);
    const errors: string[] = [];

    if (control && control.errors) {
      if (control.errors['required']) {
        errors.push('Este campo es obligatorio.');
      }
      if (control.errors['minlength']) {
        errors.push(`Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`);
      }
      if (control.errors['maxlength']) {
        errors.push(`No puede tener más de ${control.errors['maxlength'].requiredLength} caracteres.`);
      }
      if (control.errors['pattern']) {
        errors.push('El formato no es válido.');
      }
    }

    return errors;
  }

  // Método para manejar cambios en el formulario
  onDatosRefPerChange(): void {
    const data = this.formGroup.value;

    const conyugeData = {
      parentesco: 'CÓNYUGUE',
      persona_referencia: {
        primer_nombre: data.conyuge.primer_nombre,
        segundo_nombre: data.conyuge.segundo_nombre,
        tercer_nombre: data.conyuge.tercer_nombre,
        primer_apellido: data.conyuge.primer_apellido,
        segundo_apellido: data.conyuge.segundo_apellido,
        n_identificacion: data.conyuge.n_identificacion,
        telefono_1: data.conyuge.telefono_domicilio,
        telefono_2: data.conyuge.telefono_celular,
        direccion_residencia: '',
      }
    };

    const formattedData = this.formatData(data.refpers);

    this.formGroup.setValue({
      referencias: [...formattedData],
      conyuge: conyugeData
    });
  }

  formatData(refpersArray: any[]): any[] {
    return refpersArray.map(ref => ({
      tipo_referencia: ref.tipo_referencia,
      parentesco: ref.parentesco,
      persona_referencia: {
        primer_nombre: ref.primer_nombre,
        segundo_nombre: ref.segundo_nombre,
        tercer_nombre: ref.tercer_nombre,
        primer_apellido: ref.primer_apellido,
        segundo_apellido: ref.segundo_apellido,
        telefono_personal: ref.telefono_personal,
        telefono_trabajo: ref.telefono_trabajo,
        telefono_domicilio: ref.telefono_domicilio,
        direccion: ref.direccion,
        n_identificacion: ref.n_identificacion
      }
    }));
  }
}
