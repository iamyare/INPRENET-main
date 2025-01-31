import { Component, Input } from '@angular/core';
import { PersonaService } from 'src/app/services/persona.service';

@Component({
  selector: 'app-beneficiario-sin-causante',
  templateUrl: './beneficiario-sin-causante.component.html',
  styleUrl: './beneficiario-sin-causante.component.scss'
})
export class BeneficiarioSinCausanteComponent {
  @Input() persona: any;
  causantes: any[] = [];

  steps = [
     { label: 'Detalles de pagos', isActive: false },
    { label: 'Todos los pagos', isActive: false },
    { label: 'Beneficios Asignados', isActive: true },
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
