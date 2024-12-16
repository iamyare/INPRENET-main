import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConasaService } from '../../../services/conasa.service';

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

  constructor(private fb: FormBuilder, private conasaService: ConasaService) {
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

  formatDateToDDMMYYYY(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }
  

  ngOnInit(): void {
    this.cargarCategoriasYPlanes();
    const today = new Date();
    const formattedDate = this.formatDateToDDMMYYYY(today.toISOString().split('T')[0]);
    this.asistenciaForm.get('contratoData.fechaContrato')?.setValue(formattedDate);
  }

  get contratoData(): FormGroup {
    return this.asistenciaForm.get('contratoData') as FormGroup;
  }

  get beneficiariosForm(): FormArray {
    return this.asistenciaForm.get('beneficiarios') as FormArray;
  }  

  cargarCategoriasYPlanes(): void {
    this.conasaService.obtenerCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (err) => {
        console.error('Error al cargar las categorías', err);
      },
    });

    this.conasaService.obtenerPlanes().subscribe({
      next: (planes) => {
        this.planes = planes;
      },
      error: (err) => {
        console.error('Error al cargar los planes', err);
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
  
        // Ajustar el número de beneficiarios
        this.adjustBeneficiariosForm(planSeleccionado.proteccion_para);
      } else {
        this.montoCalculado = null;
        this.beneficiariosForm.clear(); // Limpiar beneficiarios si no hay plan
      }
    } else {
      this.montoCalculado = null;
      this.beneficiariosForm.clear();
    }
  }

  adjustBeneficiariosForm(requiredBeneficiarios: number): void {
    const beneficiariosForm = this.beneficiariosForm;
  
    // Ajustar el tamaño del FormArray
    while (beneficiariosForm.length < requiredBeneficiarios) {
      beneficiariosForm.push(
        this.fb.group({
          primer_nombre: ['', Validators.required],
          segundo_nombre: [''],
          primer_apellido: ['', Validators.required],
          segundo_apellido: ['', Validators.required],
          parentesco: ['', Validators.required],
          fecha_nacimiento: ['', Validators.required],
        }),
      );
    }
  
    while (beneficiariosForm.length > requiredBeneficiarios) {
      beneficiariosForm.removeAt(beneficiariosForm.length - 1);
    }
  }  
  

  handlePersonaEncontrada(persona: any): void {
    if (!persona) {
      this.persona = null;
      this.asistenciaForm.reset();
      this.beneficiariosForm.clear(); 
    } else {
      console.log(persona);
      this.persona = persona;
      this.asistenciaForm.patchValue({
        telCelular: persona?.TELEFONO_1 || '',
        correoElectronico: persona?.CORREO_1 || '',
      });
    }
  }
  
  onSubmit(): void {
    if (this.asistenciaForm.invalid) {
      console.error('El formulario es inválido.');
      return;
    }
    const contratoData = this.contratoData.value;
    const beneficiariosData = this.beneficiariosForm.value;
    const payloadContrato = {
      idPersona: this.persona.id_persona,
      idPlan: contratoData.plan,
      lugarCobro: contratoData.lugarCobro,
      fechaInicioContrato: contratoData.fechaContrato,
      fechaCancelacionContrato: contratoData.fechaCancelacion || null,
      observacion: contratoData.observacion,
    };
    const payloadBeneficiarios = beneficiariosData;
    console.log(payloadBeneficiarios);
    
    /* this.conasaService
      .manejarTransaccion(payloadContrato, payloadBeneficiarios)
      .subscribe({
        next: (mensaje) => {
          console.log(mensaje);
          alert('Contrato y beneficiarios registrados exitosamente.');
        },
        error: (err) => {
          console.error('Error al manejar la transacción:', err);
          alert('Ocurrió un error al registrar el contrato y los beneficiarios.');
        },
      }); */
  }
  
  
}
