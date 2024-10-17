import { Component, Input, OnInit } from '@angular/core';
import { PlanillaService } from 'src/app/services/planilla.service';
import { MatDialog } from '@angular/material/dialog';
import { DesglosePagoComponent } from '../desglose-pago/desglose-pago.component';

@Component({
  selector: 'app-detalle-pagos',
  templateUrl: './detalle-pagos.component.html',
  styleUrls: ['./detalle-pagos.component.scss']
})
export class DetallePagosComponent implements OnInit {
  @Input() datos: any;
  planillas: any[] = [];

  constructor(private planillaService: PlanillaService, private dialog: MatDialog) {}

  ngOnInit(): void {
    if (this.datos && this.datos.n_identificacion) {
      this.loadPlanillas(this.datos.n_identificacion);
    }
  }

  loadPlanillas(dni: string) {
    this.planillaService.obtenerPlanillasPagosPorPersona(dni).subscribe({
      next: (response) => {
        this.planillas = response.data.sort((a: any, b: any) => new Date(b.fecha_apertura).getTime() - new Date(a.fecha_apertura).getTime());
      },
      error: (error) => {
        console.error('Error al cargar las planillas de pagos', error);
      }
    });
  }

  openDialog(planilla: any): void {
    this.dialog.open(DesglosePagoComponent, {
      width: '900px',
      data: { planilla, dni: this.datos.n_identificacion }
    });
  }

}
