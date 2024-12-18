import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConasaService } from '../../../services/conasa.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ingresar-asistencia',
  templateUrl: './ingresar-asistencia.component.html',
  styleUrls: ['./ingresar-asistencia.component.scss'],
})
export class IngresarAsistenciaComponent implements OnInit {
  persona: any = null;
  asistenciaForm: FormGroup;
  categorias: any[] = [];
  planes: any[] = [];
  planesFiltrados: any[] = [];
  montoCalculado: number | null = null;
  menuTitle: string = 'Ingresar Asistencias';
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private conasaService: ConasaService, private toastr: ToastrService) {
    this.asistenciaForm = this.fb.group({
      contratoData: this.fb.group({
        fechaContrato: ['', Validators.required],
        telCelular: ['', [Validators.required, Validators.pattern(/^\d{8,12}$/)]],
        telCasa: ['', [Validators.pattern(/^\d{8,12}$/)]],
        empresa: ['', Validators.required],
        direccionTrabajo: ['', Validators.required],
        correoElectronico: ['', [Validators.required, Validators.email]],
        telTrabajo: ['', [Validators.pattern(/^\d{8,12}$/)]],
        lugarCobro: ['', Validators.required],
        categoria: ['', Validators.required],
        plan: ['', Validators.required],
        observacion: ['', [Validators.maxLength(500)]],
      }),
      beneficiarios: this.fb.array([]), // Correctamente inicializado
    });
  }

  ngOnInit(): void {
    this.cargarCategoriasYPlanes();
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    this.contratoData.get('fechaContrato')?.setValue(formattedDate);
  }

  // Acceso a los controles anidados
  get contratoData(): FormGroup {
    return this.asistenciaForm.get('contratoData') as FormGroup;
  }

  get beneficiariosForm(): FormArray {
    return this.asistenciaForm.get('beneficiarios') as FormArray;
  }

  // Cargar categorías y planes desde el servicio
  cargarCategoriasYPlanes(): void {
    this.conasaService.obtenerCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (err) => {
        console.error('Error al cargar las categorías', err);
        this.toastr.error('Error al cargar las categorías.');
      },
    });

    this.conasaService.obtenerPlanes().subscribe({
      next: (planes) => {
        this.planes = planes;
      },
      error: (err) => {
        console.error('Error al cargar los planes', err);
        this.toastr.error('Error al cargar los planes.');
      },
    });
  }

  onCategoriaChange(): void {
    const idCategoria = this.contratoData.get('categoria')?.value;
    if (idCategoria) {
      this.planesFiltrados = this.planes.filter(plan => plan.categoria?.id_categoria === +idCategoria);
      this.contratoData.get('plan')?.reset();
      this.montoCalculado = null;
    }
  }

  onPlanChange(): void {
    const idPlan = this.contratoData.get('plan')?.value;
    if (idPlan) {
      const planSeleccionado = this.planesFiltrados.find(plan => plan.id_plan === idPlan);
      if (planSeleccionado) {
        this.montoCalculado = planSeleccionado.precio;
        this.adjustBeneficiariosForm(planSeleccionado.proteccion_para);
      }
    } else {
      this.montoCalculado = null;
      this.beneficiariosForm.clear();
    }
  }

  adjustBeneficiariosForm(requiredBeneficiarios: number): void {
    while (this.beneficiariosForm.length < requiredBeneficiarios) {
      this.beneficiariosForm.push(
        this.fb.group({
          primer_nombre: ['', Validators.required],
          segundo_nombre: [''],
          primer_apellido: ['', Validators.required],
          segundo_apellido: [''],
          parentesco: ['', Validators.required],
          fecha_nacimiento: ['', Validators.required],
        })
      );
    }
    while (this.beneficiariosForm.length > requiredBeneficiarios) {
      this.beneficiariosForm.removeAt(this.beneficiariosForm.length - 1);
    }
  }

  handlePersonaEncontrada(persona: any): void {
    if (!persona) {
      this.resetEstadoInicial();
      return;
    }
  
    // Verificar si la persona tiene un contrato activo
    this.conasaService.verificarContrato(persona.ID_PERSONA).subscribe({
      next: (response) => {
        if (response.tieneContrato) {
          this.toastr.warning('La persona ya tiene un contrato activo.', 'Advertencia');
          this.resetEstadoInicial(); // No asignar la persona ni actualizar el formulario
        } else {
          // Si no tiene contrato, asignar la persona
          this.persona = persona;
          this.asistenciaForm.patchValue({
            contratoData: { lugarCobro: persona?.lugar_cobro || '' },
          });
        }
      },
      error: (err) => {
        console.error('Error al verificar el contrato:', err);
        this.toastr.error('Error al verificar el contrato.', 'Error');
        this.resetEstadoInicial();
      },
    });
  }
  
  // Enviar datos al backend
  onSubmit(): void {
    if (this.asistenciaForm.valid) {
      if (!this.persona) {
        this.toastr.error('Debe seleccionar una persona antes de continuar.', 'Error');
        return;
      }
  
      const contratoData = this.contratoData.value;
      const beneficiarios = this.beneficiariosForm.value;
  
      console.log('Contrato Data:', contratoData);
      console.log('Beneficiarios Data:', beneficiarios);
  
      const payload = {
        contrato: {
          idPersona: this.persona?.ID_PERSONA,
          idPlan: contratoData.plan,
          lugarCobro: contratoData.lugarCobro,
          fechaInicioContrato: contratoData.fechaContrato,
          observacion: contratoData.observacion,
        },
        beneficiarios: beneficiarios.map((beneficiario: any) => ({
          primer_nombre: beneficiario.primer_nombre,
          segundo_nombre: beneficiario.segundo_nombre || null,
          primer_apellido: beneficiario.primer_apellido,
          segundo_apellido: beneficiario.segundo_apellido || null,
          parentesco: beneficiario.parentesco,
          fecha_nacimiento: this.formatDateToYYYYMMDD(beneficiario.fecha_nacimiento),
        })),
      };
  
      console.log('Payload a enviar:', JSON.stringify(payload, null, 2));
  
      this.isLoading = true;
      this.conasaService.crearContrato(payload).subscribe({
        next: (response) => {
          if (response.statusCode === 201) {
            this.toastr.success(response.message, 'Éxito');
            this.resetForm();
          } else {
            this.toastr.error('Ocurrió un error inesperado.', 'Error');
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al crear el contrato:', error);
          const errorMsg = error.error?.message || 'Error al crear el contrato. Intente nuevamente.';
          this.toastr.error(errorMsg, 'Error');
          this.isLoading = false;
        },
      });
      
      
    } else {
      this.toastr.warning('Por favor complete todos los campos obligatorios.', 'Advertencia');
    }
  }

  // Resetear el formulario
  resetForm(): void {
    this.asistenciaForm.reset({
      contratoData: {
        fechaContrato: new Date().toISOString().split('T')[0],
      },
    });
    this.beneficiariosForm.clear();
    this.persona = null;
    this.montoCalculado = null;
  }
  
  formatDateToYYYYMMDD(date: any): string {
    if (!date) return '';
    
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  
    if (typeof date === 'string' && date.includes('-')) {
      const [year, month, day] = date.split('-');
      return `${year}-${month}-${day}`;
    }
  
    console.warn('Formato de fecha no válido:', date);
    return ''; 
  }
  
  resetEstadoInicial(): void {
    this.persona = null;
    this.asistenciaForm.reset();
    this.beneficiariosForm.clear();
    this.montoCalculado = null;
  }
  
}
