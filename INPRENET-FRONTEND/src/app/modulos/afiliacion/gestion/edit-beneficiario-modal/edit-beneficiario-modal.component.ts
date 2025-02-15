import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DireccionService } from 'src/app/services/direccion.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

interface Departamento {
  id_departamento: number;
  nombre_departamento: string;
}

interface Municipio {
  id_municipio: number;
  nombre_municipio: string;
}

@Component({
  selector: 'app-edit-beneficiario-modal',
  templateUrl: './edit-beneficiario-modal.component.html',
  styleUrls: ['./edit-beneficiario-modal.component.scss']
})
export class EditBeneficiarioModalComponent implements OnInit {
  formGroup!: FormGroup;
  departamentos: { value: number; label: string }[] = [];
  municipios: { value: number; label: string }[] = [];
  departamentosNacimiento: { value: number; label: string }[] = [];
  municipiosNacimiento: { value: number; label: string }[] = [];
  genero: any = [];
  parentesco: any = [];
  porcentajeDisponible: number = 0;
  
  constructor(
    private fb: FormBuilder,
    private direccionSer: DireccionService,
    private datosEstaticosService: DatosEstaticosService,
    public dialogRef: MatDialogRef<EditBeneficiarioModalComponent>,
    @Inject(MAT_DIALOG_DATA) public initialData: any
  ) {}

  async ngOnInit(): Promise<void> {
    this.porcentajeDisponible = this.initialData.porcentajeDisponible || 0;
    this.formGroup = this.fb.group({
      id_causante: [this.initialData.beneficiario?.id_causante || null],
      id_detalle_persona: [this.initialData.beneficiario?.id_detalle_persona || null],
      n_identificacion: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(13), Validators.maxLength(13)]],
      primer_nombre: ['', [Validators.maxLength(40)]],
      segundo_nombre: ['', [Validators.maxLength(40)]],
      tercer_nombre: [''],
      primer_apellido: ['', [Validators.maxLength(40)]],
      segundo_apellido: [''],
      genero: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
      telefono_1: ['', Validators.required],
      direccion_residencia: ['', Validators.required],
      id_departamento_nacimiento: ['', Validators.required],
      id_municipio_nacimiento: ['', Validators.required],
      id_departamento_residencia: ['', Validators.required],
      id_municipio_residencia: ['', Validators.required],
      parentesco: ['', Validators.required],
      porcentaje: ['', [Validators.required, Validators.min(1), Validators.max(100), this.validarPorcentajeDisponible.bind(this)]]
    });

    this.genero = this.datosEstaticosService.genero;
    this.parentesco = this.datosEstaticosService.parentesco;

    await this.cargarDatosIniciales();
    this.markAllAsTouched();
  }

  validarPorcentajeDisponible(control: AbstractControl): ValidationErrors | null {
    const porcentajeIngresado = control.value;

    if (porcentajeIngresado < 0) {
        return { porcentajeNegativo: true };
    }

    if (porcentajeIngresado > this.porcentajeDisponible) {
        return { porcentajeExcedido: true };
    }

    return null; // Es válido
}


  markAllAsTouched(): void {
    this.formGroup.markAllAsTouched();
  }

  async cargarDatosIniciales() {
    
    
    await this.cargarDepartamentos();

    if (this.initialData.beneficiario?.id_departamento_nacimiento) {
      await this.cargarMunicipiosNacimiento(this.initialData.beneficiario.id_departamento_nacimiento);
    }

    if (this.initialData.beneficiario?.id_departamento_residencia) {
      await this.cargarMunicipios(this.initialData.beneficiario.id_departamento_residencia);
    }

    let fechaNacimiento: Date | null = null;
    if (this.initialData.beneficiario.fecha_nacimiento) {
      const [day, month, year] = this.initialData.beneficiario.fecha_nacimiento.split('/');
      fechaNacimiento = new Date(+year, +month - 1, +day);
    }

    this.formGroup.patchValue({
        ...this.initialData.beneficiario,
        fecha_nacimiento: fechaNacimiento
    });
  }

  async cargarDepartamentos() {
    return new Promise<void>((resolve) => {
      this.direccionSer.getAllDepartments().subscribe({
        next: (data: any) => {
          this.departamentos = data.map((departamento: Departamento) => ({
            value: departamento.id_departamento,
            label: departamento.nombre_departamento
          }));
          this.departamentosNacimiento = [...this.departamentos];
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar departamentos:', error);
          resolve();
        }
      });
    });
  }

  async cargarMunicipios(departamentoId: number) {
    return new Promise<void>((resolve) => {
      this.direccionSer.getMunicipiosPorDepartamentoId(departamentoId).subscribe({
        next: (data: any) => {
          this.municipios = [...data]; 
          setTimeout(() => {
            this.formGroup.patchValue({
              id_municipio_residencia: this.initialData.beneficiario.id_municipio_residencia || null
            });
          }, 100);
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar municipios:', error);
          resolve();
        }
      });
    });
  }

  async cargarMunicipiosNacimiento(departamentoId: number) {
    return new Promise<void>((resolve) => {
      this.direccionSer.getMunicipiosPorDepartamentoId(departamentoId).subscribe({
        next: (data: any) => {
          this.municipiosNacimiento = [...data]; 
          setTimeout(() => {
            this.formGroup.patchValue({
              id_municipio_nacimiento: this.initialData.beneficiario.id_municipio_nacimiento || null
            });
          }, 100);
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar municipios de nacimiento:', error);
          resolve();
        }
      });
    });
  }

  onDepartamentoChange(event: any) {
    const departamentoId = event.value;
    this.cargarMunicipios(departamentoId);
  }

  onDepartamentoNacimientoChange(event: any) {
    const departamentoId = event.value;
    this.cargarMunicipiosNacimiento(departamentoId);
  }

  guardar(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const formData = {
      ...this.formGroup.value,
      id_causante_padre: this.initialData.beneficiario?.id_causante || null,
      id_detalle_persona: this.initialData.beneficiario?.idDetallePersona || null
    };
    this.dialogRef.close(formData);
}

  
  cancelar(): void {
    this.dialogRef.close();
  }
}
