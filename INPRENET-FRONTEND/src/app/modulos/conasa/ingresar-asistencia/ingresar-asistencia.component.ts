import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConasaService } from 'src/app/services/conasa.service';

@Component({
  selector: 'app-ingresar-asistencia',
  templateUrl: './ingresar-asistencia.component.html',
  styleUrls: ['./ingresar-asistencia.component.scss'],
})
export class IngresarAsistenciaComponent implements OnInit {
  persona: any = null; // Almacena la persona encontrada
  asistenciaForm: FormGroup;
  categorias: any[] = [];
  planes: any[] = [];
  planesFiltrados: any[] = [];
  montoCalculado: number | null = null;

  constructor(private fb: FormBuilder, private conasaService: ConasaService) {
    // Inicializar el formulario
    this.asistenciaForm = this.fb.group({
      fechaContrato: ['', Validators.required],
      telCelular: ['', [Validators.required, Validators.pattern(/^\d{8,12}$/)]],
      telCasa: ['', [Validators.pattern(/^\d{8,12}$/)]],
      empresa: ['', Validators.required],
      direccionTrabajo: ['', Validators.required],
      correoElectronico: ['', [Validators.required, Validators.email]],
      telTrabajo: ['', [Validators.pattern(/^\d{8,12}$/)]],
      lugarCobro: ['', Validators.required],
      categoria: ['', Validators.required], // Asegúrate de agregarlo
      plan: ['', Validators.required]       // Asegúrate de agregarlo
    });    
  }

  ngOnInit(): void {
    this.cargarCategoriasYPlanes();
  }

  cargarCategoriasYPlanes(): void {
    // Cargar las categorías
    this.conasaService.obtenerCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (err) => {
        console.error('Error al cargar las categorías', err);
      },
    });

    // Cargar los planes
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
    const idCategoria = this.asistenciaForm.get('categoria')?.value;
  
    if (idCategoria) {
      this.planesFiltrados = this.planes.filter(plan => {
        return plan.categoria?.id_categoria === +idCategoria; 
      });
  
      this.asistenciaForm.get('plan')?.reset();
      this.montoCalculado = null;
    }
  }
  
  

  onPlanChange(): void {
    const idPlan = this.asistenciaForm.get('plan')?.value;
    if (idPlan) {
      const planSeleccionado = this.planes.find(plan => plan.id_plan === idPlan);
      if (planSeleccionado) {
        this.montoCalculado = planSeleccionado.precio; // Actualizar el monto calculado
      }
    }
  }

  handlePersonaEncontrada(persona: any): void {
    if (!persona) {
      this.persona = null;
      this.asistenciaForm.reset();
    } else {
      this.persona = persona;
      this.asistenciaForm.patchValue({
        telCelular: persona?.TELEFONO_CELULAR || '',
        correoElectronico: persona?.CORREO_1 || '',
      });
    }
  }

  onSubmit(): void {
    if (this.asistenciaForm.valid) {
      console.log('Asistencia registrada:', this.asistenciaForm.value);
    } else {
      console.log('Formulario inválido.');
    }
  }
}
