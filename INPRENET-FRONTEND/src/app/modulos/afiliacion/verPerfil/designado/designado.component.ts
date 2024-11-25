import { Component, Input } from '@angular/core';
import { PersonaService } from 'src/app/services/persona.service';

@Component({
  selector: 'app-designado',
  templateUrl: './designado.component.html',
  styleUrl: './designado.component.scss'
})
export class DesignadoComponent {
  @Input() persona: any;
  causantes: any[] = [];

  steps = [
    { label: 'Detalles de pagos', isActive: true },
    { label: 'Todos los pagos', isActive: false },
    { label: 'Beneficios Asignados', isActive: false },
    { label: 'Detalles De Causantes', isActive: false },
    /* { label: 'Constancias', isActive: false }, */
  ];

  currentStepIndex = 0;

  constructor(private personaService: PersonaService) {}

  ngOnInit() {
    if (this.persona) {
      this.loadCausantes(this.persona.n_identificacion);
    }
  }

  onStepChange(index: number) {
    this.currentStepIndex = index;
  }

  loadCausantes(n_identificacion: string) {
    this.personaService.getCausantesBy_n_identificacionBeneficiario(n_identificacion).subscribe(data => {
      this.causantes = data;
    });
  }

}
