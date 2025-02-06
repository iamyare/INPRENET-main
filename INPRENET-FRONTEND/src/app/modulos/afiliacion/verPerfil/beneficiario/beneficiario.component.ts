import { Component, Input, OnInit } from '@angular/core';
import { PersonaService } from 'src/app/services/persona.service';

@Component({
  selector: 'app-beneficiario',
  templateUrl: './beneficiario.component.html',
  styleUrls: ['./beneficiario.component.scss']
})
export class BeneficiarioComponent implements OnInit {
  @Input() persona: any;
  causantes: any[] = [];

  steps = [
    { label: 'Beneficios Asignados', isActive: true },
   // { label: 'Detalles de pagos', isActive: false },
    //{ label: 'Todos los pagos', isActive: false },
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
