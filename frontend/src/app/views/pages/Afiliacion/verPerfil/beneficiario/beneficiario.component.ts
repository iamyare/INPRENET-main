import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-beneficiario',
  templateUrl: './beneficiario.component.html',
  styleUrls: ['./beneficiario.component.scss']
})
export class BeneficiarioComponent implements OnInit {
  @Input() detalle: any;

  steps = [
    { label: 'Constancias', isActive: true },
    { label: 'Beneficios Asignados', isActive: false }
  ];

  currentStepIndex = 0;

  ngOnInit() {
    console.log(this.detalle);
  }

  onStepChange(index: number) {
    this.currentStepIndex = index;
  }
}
