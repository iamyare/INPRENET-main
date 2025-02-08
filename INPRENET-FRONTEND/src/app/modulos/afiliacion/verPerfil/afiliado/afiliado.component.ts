import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { PermisosService } from 'src/app/services/permisos.service';

@Component({
  selector: 'app-afiliado',
  templateUrl: './afiliado.component.html',
  styleUrls: ['./afiliado.component.scss']
})
export class AfiliadoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() persona: any;

  currentStepIndex = 0;
  public mostrarDetallesPagos: boolean = false;
  public mostrarTodosPagos: boolean = false;

  steps = [
    { label: 'Fuentes De Ingreso', isActive: true },
    { label: 'Beneficiarios', isActive: true },
    { label: 'Colegios Magisteriales', isActive: true },
    { label: 'Referencias Personales', isActive: true },
  ];

  constructor(private permisosService: PermisosService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['persona'] && this.persona) {
      this.initializeComponent();
    }
  }

  ngOnDestroy(): void {}

  initializeComponent(): void {
    if (!this.persona) {
      return;
    }

    // Verificar permisos
    this.mostrarDetallesPagos = this.permisosService.userHasPermission('AFILIACIONES', 'afiliacion/buscar-persona', ['verpago', 'editarDos']) ;
    this.mostrarTodosPagos = this.permisosService.userHasPermission('AFILIACIONES', 'afiliacion/buscar-persona', ['verpago', 'editarDos']);

    // Evitar duplicados eliminando si ya existen
    this.steps = this.steps.filter(step => step.label !== 'Detalles de pagos' && step.label !== 'Todos los pagos');

    // Agregar solo si el usuario tiene permisos
    if (this.mostrarDetallesPagos) {
      this.steps.push({ label: 'Detalles de pagos', isActive: true });
    }
    if (this.mostrarTodosPagos) {
      this.steps.push({ label: 'Todos los pagos', isActive: true });
    }

    this.cdr.detectChanges();
  }

  onStepChange(index: number) {
    this.currentStepIndex = index;
  }
}
