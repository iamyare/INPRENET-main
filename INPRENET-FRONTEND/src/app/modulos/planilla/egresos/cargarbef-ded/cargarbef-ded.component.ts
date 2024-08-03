import { Component } from '@angular/core';
import { PlanillaService } from 'src/app/services/planilla.service';

@Component({
  selector: 'app-cargarbef-ded',
  templateUrl: './cargarbef-ded.component.html',
  styleUrls: ['./cargarbef-ded.component.scss']
})
export class CargarbefDedComponent {
  constructor(private planillaService: PlanillaService) { }

  asignarBeneficiosOrdinariaBeneficiariosAfiliados() {
    this.planillaService.generarPlanillaOrdinaria('BENEFICIARIO,AFILIADO').subscribe({
      next: () => console.log('Planilla ordinaria generada para Beneficiarios y Afiliados'),
      error: err => console.error('Error:', err)
    });
  }

  asignarBeneficiosOrdinariaJubiladosPensionados() {
    this.planillaService.generarPlanillaOrdinaria('JUBILADO,VOLUNTARIO,PENSIONADO').subscribe({
      next: () => console.log('Planilla ordinaria generada para Jubilados y Pensionados'),
      error: err => console.error('Error:', err)
    });
  }

  asignarBeneficiosComplementariaBeneficiariosAfiliados() {
    this.planillaService.generarPlanillaComplementaria('BENEFICIARIO,AFILIADO').subscribe({
      next: () => console.log('Planilla complementaria generada para Beneficiarios y Afiliados'),
      error: err => console.error('Error:', err)
    });
  }

  asignarBeneficiosComplementariaJubiladosPensionados() {
    this.planillaService.generarPlanillaComplementaria('JUBILADO,VOLUNTARIO,PENSIONADO').subscribe({
      next: () => console.log('Planilla complementaria generada para Jubilados y Pensionados'),
      error: err => console.error('Error:', err)
    });
  }
}
