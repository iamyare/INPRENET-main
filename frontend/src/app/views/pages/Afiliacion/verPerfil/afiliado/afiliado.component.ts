import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-afiliado',
  templateUrl: './afiliado.component.html',
  styleUrls: ['./afiliado.component.scss']
})
export class AfiliadoComponent implements OnInit {
  @Input() persona: any = {};

  currentStepIndex = 0;

  steps = [
    { label: 'Constancias', isActive: true },
    { label: 'Designados Beneficiarios', isActive: true },
    { label: 'Cuentas INPREMA', isActive: true },
    { label: 'Colegios Magisteriales', isActive: true },
    { label: 'Referencias Personales', isActive: true },
  ];

  ngOnInit(): void {
    console.log('AfiliadoComponent - persona:', this.persona);
  }

  onStepChange(index: number) {
    this.currentStepIndex = index;
  }
}
