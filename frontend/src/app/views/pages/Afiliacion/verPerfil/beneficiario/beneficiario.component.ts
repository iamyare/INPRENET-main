import { Component, Input, OnInit } from '@angular/core';
import { PersonaService } from 'src/app/services/persona.service';

@Component({
  selector: 'app-beneficiario',
  templateUrl: './beneficiario.component.html',
  styleUrls: ['./beneficiario.component.scss']
})
export class BeneficiarioComponent implements OnInit {
  @Input() persona: any; // Recibe el objeto completo de la persona
  causantes: any[] = [];

  steps = [
    { label: 'Constancias', isActive: true },
    { label: 'Beneficios Asignados', isActive: false },
    { label: 'Causantes Detalles', isActive: false }
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
