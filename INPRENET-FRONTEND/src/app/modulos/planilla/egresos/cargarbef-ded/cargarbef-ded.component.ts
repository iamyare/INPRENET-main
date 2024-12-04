import { Component } from '@angular/core';
import { PlanillaService } from 'src/app/services/planilla.service';
import { ToastrService } from 'ngx-toastr';
import { BeneficiosService } from 'src/app/services/beneficios.service';
import { MontoDialogComponent } from '../../monto-dialog/monto-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-cargarbef-ded',
  templateUrl: './cargarbef-ded.component.html',
  styleUrls: ['./cargarbef-ded.component.scss']
})
export class CargarbefDedComponent {
  tipoPlanilla: any;
  dni: string = '';
  beneficios: any[] = [];
  loading: boolean = false;
  id_planilla: any
  idTipoPlanilla: any

  displayedColumns: string[] = ['causante', 'beneficio', 'select'];

  constructor(private planillaService: PlanillaService, private toastr: ToastrService, private SVCBeneficios: BeneficiosService, private dialog: MatDialog) { }

  asignarBeneficiosOrdinariaBeneficiariosAfiliados() {
    this.planillaService.generarPlanillaOrdinaria('BENEFICIARIO SIN CAUSANTE,BENEFICIARIO').subscribe({
      next: () => {
        this.toastr.success('Planilla ordinaria generada para Beneficiarios y Afiliados', 'Éxito');
      },
      error: err => {
        this.toastr.error('Error al generar la planilla ordinaria para Beneficiarios y Afiliados', 'Error');
      }
    });
  }

  asignarBeneficiosOrdinariaJubiladosPensionados() {
    this.planillaService.generarPlanillaOrdinaria('JUBILADO,PENSIONADO').subscribe({
      next: () => {
        this.toastr.success('Planilla ordinaria generada para Jubilados y Pensionados', 'Éxito');
      },
      error: err => {
        this.toastr.error('Error al generar la planilla ordinaria para Jubilados y Pensionados', 'Error');
      }
    });
  }

  asignarBeneficiosComplementariaBeneficiariosAfiliados() {
    this.planillaService.generarPlanillaComplementaria('BENEFICIARIO').subscribe({
      next: () => {
        this.toastr.success('Planilla complementaria generada para Beneficiarios y Afiliados', 'Éxito');
      },
      error: err => {
        this.toastr.error('Error al generar la planilla complementaria para Beneficiarios y Afiliados', 'Error');
      }
    });
  }

  asignarBeneficiosComplementariaJubiladosPensionados() {
    this.planillaService.generarPlanillaComplementaria('PENSIONADO,JUBILADO,AFILIADO').subscribe({
      next: () => {
        this.toastr.success('Planilla complementaria generada para Jubilados y Pensionados', 'Éxito');
      },
      error: err => {
        this.toastr.error('Error al generar la planilla complementaria para Jubilados y Pensionados', 'Error');
      }
    });
  }

  getElemSeleccionados(event: any) {
    this.idTipoPlanilla = event.idTipoPlanilla;
    this.tipoPlanilla = event.tipoPlanilla;
    this.id_planilla = event.id_planilla;
  }

  buscarBeneficiosPorDni() {
    if (this.dni) {
      this.loading = true;
      this.SVCBeneficios.obtenerCausantesYBeneficios(this.dni).subscribe({
        next: (response) => {
          this.beneficios = this.flattenBeneficios(response);
          this.loading = false;
        },
        error: (err) => {
          this.toastr.error('Error al buscar beneficios', 'Error');
          this.loading = false;
        }
      });
    } else {
      this.toastr.warning('Por favor, ingrese un DNI', 'Advertencia');
    }
  }

  flattenBeneficios(causantes: any[]): any[] {
    let beneficiosAplanados: any[] = [];

    causantes.forEach(causante => {
      causante.beneficios.forEach((beneficio: any) => {
        beneficiosAplanados.push({
          causante: causante.causante,
          beneficio: beneficio.beneficio,
          detalleBeneficio: beneficio
        });
      });
    });
    return beneficiosAplanados;
  }

  seleccionarBeneficio(beneficio: any) {
    const dialogRef = this.dialog.open(MontoDialogComponent, {
      width: '250px',
      data: { monto_a_pagar: 0 }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        const data = {
          id_persona: beneficio.detalleBeneficio.ID_PERSONA,
          id_causante: beneficio.detalleBeneficio.ID_CAUSANTE,
          id_detalle_persona: beneficio.detalleBeneficio.ID_DETALLE_PERSONA,
          id_beneficio: beneficio.detalleBeneficio.ID_BENEFICIO,
          id_planilla: this.id_planilla, // Usa el id_planilla obtenido
          monto_a_pagar: result.monto_a_pagar
        };
        this.SVCBeneficios.insertarDetallePagoBeneficio(data).subscribe({
          next: () => {
            this.toastr.success('Detalle de pago insertado correctamente.');
          },
          error: (error) => {
            console.error('Error al insertar detalle del pago del beneficio', error);
            this.toastr.error('Error al insertar el detalle del pago.');
          }
        });
      }
    });
  }


}
