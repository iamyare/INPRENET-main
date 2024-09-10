import { Component } from '@angular/core';
import { PlanillaService } from 'src/app/services/planilla.service';
import { ToastrService } from 'ngx-toastr'; // Importar ToastrService

@Component({
  selector: 'app-cargarbef-ded',
  templateUrl: './cargarbef-ded.component.html',
  styleUrls: ['./cargarbef-ded.component.scss']
})
export class CargarbefDedComponent {
  constructor(private planillaService: PlanillaService, private toastr: ToastrService) { }

  asignarBeneficiosOrdinariaBeneficiariosAfiliados() {
    this.planillaService.generarPlanillaOrdinaria('BENEFICIARIO,AFILIADO,BENEFICIARIO SIN CAUSANTE').subscribe({
      next: () => {
        console.log('Planilla ordinaria generada para Beneficiarios y Afiliados');
        this.toastr.success('Planilla ordinaria generada para Beneficiarios y Afiliados', 'Éxito');
      },
      error: err => {
        console.error('Error:', err);
        this.toastr.error('Error al generar la planilla ordinaria para Beneficiarios y Afiliados', 'Error');
      }
    });
  }

  asignarBeneficiosOrdinariaJubiladosPensionados() {
    this.planillaService.generarPlanillaOrdinaria('JUBILADO,VOLUNTARIO,PENSIONADO').subscribe({
      next: () => {
        console.log('Planilla ordinaria generada para Jubilados y Pensionados');
        this.toastr.success('Planilla ordinaria generada para Jubilados y Pensionados', 'Éxito');
      },
      error: err => {
        console.error('Error:', err);
        this.toastr.error('Error al generar la planilla ordinaria para Jubilados y Pensionados', 'Error');
      }
    });
  }

  asignarBeneficiosComplementariaBeneficiariosAfiliados() {
    this.planillaService.generarPlanillaComplementaria('BENEFICIARIO,AFILIADO').subscribe({
      next: () => {
        console.log('Planilla complementaria generada para Beneficiarios y Afiliados');
        this.toastr.success('Planilla complementaria generada para Beneficiarios y Afiliados', 'Éxito');
      },
      error: err => {
        console.error('Error:', err);
        this.toastr.error('Error al generar la planilla complementaria para Beneficiarios y Afiliados', 'Error');
      }
    });
  }

  asignarBeneficiosComplementariaJubiladosPensionados() {
    this.planillaService.generarPlanillaComplementaria('JUBILADO,VOLUNTARIO,PENSIONADO').subscribe({
      next: () => {
        console.log('Planilla complementaria generada para Jubilados y Pensionados');
        this.toastr.success('Planilla complementaria generada para Jubilados y Pensionados', 'Éxito');
      },
      error: err => {
        console.error('Error:', err);
        this.toastr.error('Error al generar la planilla complementaria para Jubilados y Pensionados', 'Error');
      }
    });
  }
}
