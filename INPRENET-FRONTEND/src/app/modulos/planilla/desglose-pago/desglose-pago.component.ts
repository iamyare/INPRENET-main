import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlanillaService } from 'src/app/services/planilla.service';

@Component({
  selector: 'app-desglose-pago',
  templateUrl: './desglose-pago.component.html',
  styleUrls: ['./desglose-pago.component.scss']
})
export class DesglosePagoComponent implements OnInit {
  persona: any = {};
  beneficios: any[] = [];
  deducciones: any[] = [];
  bancos: any[] = [];
  loading = true;
  totalPagado: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { planilla: any, dni: string },
    private planillaService: PlanillaService
  ) {}

  ngOnInit(): void {
    this.obtenerPagosYBeneficiosPorPersona(this.data.planilla.id_planilla, this.data.dni);
    this.scrollToTop();
  }

  scrollToTop(): void {
    setTimeout(() => {
      const container = document.querySelector('.mat-dialog-container');
      if (container) {
        container.scrollTop = 0;
      }
    }, 0);
  }

  obtenerPagosYBeneficiosPorPersona(idPlanilla: number, dni: string) {
    this.planillaService.obtenerPagosYBeneficiosPorPersona(idPlanilla, dni).subscribe({
      next: (response) => {
        this.persona = response.persona;
        this.beneficios = response.beneficios;
        this.deducciones = response.deducciones;
        this.bancos = response.bancos;
        this.calcularTotalPagado();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener los datos', error);
        this.loading = false;
      }
    });
  }

  calcularTotalPagado() {
    let totalBeneficios = this.beneficios.reduce((total, beneficio) => {
      let totalPagosBeneficio = beneficio.pagos.reduce((sum:any, pago:any) => sum + pago.monto_a_pagar, 0);
      return total + totalPagosBeneficio;
    }, 0);
    let totalDeducciones = this.deducciones.reduce((total, deduccion) => total + deduccion.monto_total, 0);
    this.totalPagado = totalBeneficios - totalDeducciones;
  }
}
