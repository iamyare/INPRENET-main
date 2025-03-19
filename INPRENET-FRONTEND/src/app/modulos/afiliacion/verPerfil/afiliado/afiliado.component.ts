import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { PermisosService } from 'src/app/services/permisos.service';
import { AfiliacionService } from '../../../../services/afiliacion.service';

@Component({
  selector: 'app-afiliado',
  templateUrl: './afiliado.component.html',
  styleUrls: ['./afiliado.component.scss']
})
export class AfiliadoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() persona: any;
  @Output() onDatoAgregado = new EventEmitter<void>();

  currentStepIndex = 0;
  public mostrarDetallesPagos: boolean = false;
  public mostrarTodosPagos: boolean = false;

  steps = [
    { label: 'Fuentes De Ingreso', isActive: true, isError: false },
    { label: 'Beneficiarios', isActive: false, isError: false },
    { label: 'Colegios Magisteriales', isActive: false, isError: false },
    { label: 'Referencias Personales', isActive: false, isError: false },
  ];

  constructor(private afiliacionService: AfiliacionService, private permisosService: PermisosService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initializeComponent();
    this.verificarBancosBeneficiariosReferenciasCentroTrabajo();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['persona'] && this.persona) {
      this.initializeComponent();
      this.verificarBancosBeneficiariosReferenciasCentroTrabajo();
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
      this.steps.push({ label: 'Detalles de pagos', isActive: false, isError: false });
    }
    if (this.mostrarTodosPagos) {
      this.steps.push({ label: 'Todos los pagos', isActive: false, isError: false });
    }

    this.cdr.detectChanges();
  }

  verificarBancosBeneficiariosReferenciasCentroTrabajo(): void {
    if (this.persona?.id_persona) {
      this.afiliacionService.tieneBancoActivo(this.persona.id_persona).subscribe(({ beneficiariosValidos, tieneReferencias, tieneCentroTrabajo }) => {
        this.steps = this.steps.map((step: any, index: any) => ({
          ...step,
          isError: (index === 1 && !beneficiariosValidos) || 
                   (index === 0 && !tieneCentroTrabajo) || 
                   (index === 3 && !tieneReferencias) ? true : false,
        }));
        this.cdr.detectChanges();
      });
    }
  }
  
  notificarDatoAgregado(): void {
    this.verificarBancosBeneficiariosReferenciasCentroTrabajo();
    this.onDatoAgregado.emit();
    this.cdr.detectChanges();
  }
  
  onStepChange(index: number): void {
    this.steps.forEach((step, i) => step.isActive = i === index);
    this.currentStepIndex = index;
  }
}
