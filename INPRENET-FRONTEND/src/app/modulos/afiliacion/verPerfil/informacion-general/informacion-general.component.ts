import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AfiliacionService } from 'src/app/services/afiliacion.service';

@Component({
  selector: 'app-informacion-general',
  templateUrl: './informacion-general.component.html',
  styleUrls: ['./informacion-general.component.scss']
})
export class InformacionGeneralComponent implements OnInit {
  @Input() persona: any;
  @Output() onDatoAgregado = new EventEmitter<void>();
  
  steps = [
    { label: 'Información General', isActive: true, isError: false },
    { label: 'Datos Bancarios', isActive: false, isError: false },
    { label: 'Cónyuge', isActive: false },
    { label: 'PEPS', isActive: false },
  ];

  currentStepIndex = 0;

  constructor(private afiliacionService: AfiliacionService,  private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.verificarBancos();
  }

  verificarBancos(): void {
    if (this.persona?.id_persona) {
      this.afiliacionService.tieneBancoActivo(this.persona.id_persona).subscribe((res) => {
        const updatedSteps = this.steps.map((step, index) => ({
          ...step,
          isError: (index === 0 && !res.datosCompletos) || 
                   (index === 1 && !res.tieneBancoActivo)
        }));

        this.steps = [...updatedSteps];
        this.cdr.detectChanges();
        this.onDatoAgregado.emit();
      });
    }
  }

  onBancoAgregado() {
    this.verificarBancos();
    this.onDatoAgregado.emit();
  }

  handleDatoActualizado(): void {
    this.verificarBancos();
    this.onDatoAgregado.emit();
  }

  onStepChange(index: number) {
    this.steps.forEach((step, i) => step.isActive = i === index);
    this.currentStepIndex = index;
  }
}
