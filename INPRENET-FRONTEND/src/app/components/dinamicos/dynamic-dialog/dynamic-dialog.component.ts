import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { DeduccionesService } from 'src/app/services/deducciones.service';
import { BeneficiosService } from 'src/app/services/beneficios.service';
@Component({
  selector: 'app-dynamic-dialog',
  templateUrl: './dynamic-dialog.component.html',
  styleUrls: ['./dynamic-dialog.component.scss']
})
export class DynamicDialogComponent implements OnInit {
  @Input() titulo = "";
  @Input() subtitulo = "";
  @Output() deduccionEliminada = new EventEmitter<void>();
  dialogTitle: string = 'Desglose';

  displayedColumnsB: string[] = ['NOMBRE_BENEFICIO', 'MontoAPagar'];
  displayedColumnsD: string[] = ['NOMBRE_INSTITUCION', 'NOMBRE_DEDUCCION', 'MontoAplicado'];
  mostrarAccion: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { logs: any[], mostrarAccion: boolean },
    private deduccionSVC: DeduccionesService,
    private detBenSVC: BeneficiosService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<DynamicDialogComponent>
  ) { }

  ngOnInit() {
    this.dialogTitle = this.titulo || 'Desglose';
    this.mostrarAccion = this.data.mostrarAccion;

    if (this.mostrarAccion) {
      this.displayedColumnsB.push('OBSERVACION');
      this.displayedColumnsB.push('accion');
      this.displayedColumnsD.push('accion');
    }
  }

  accionDeduccion(element: any) {
    this.deduccionSVC.eliminarDetalleDeduccion(element.ID_DED_DEDUCCION).subscribe(
      (response) => {
        this.toastr.success('Deducción eliminada con éxito', 'Éxito', { closeButton: true });
        this.dialogRef.close();
        this.deduccionEliminada.emit();
      },
      (error) => {
        this.toastr.error('Error al eliminar la deducción', 'Error', { closeButton: true });
      }
    );
  }

  accionBeneficio(element: any) {
    const data = {
      idBenPlanilla: element.ID_BENEFICIO_PLANILLA,
      ID_DETALLE_PERSONA: element.ID_DETALLE_PERSONA,
      ID_PERSONA: element.ID_PERSONA,
      ID_CAUSANTE: element.ID_CAUSANTE,
      ID_BENEFICIO: element.ID_BENEFICIO,
      observacion: element.observacion
    };

    this.detBenSVC.eliminarBenPlan(data).subscribe(
      (response) => {
        this.toastr.success('Beneficio eliminado con éxito', 'Éxito', { closeButton: true });
        this.dialogRef.close();
        this.deduccionEliminada.emit();
      },
      (error) => {
        this.toastr.error('Error al eliminar el beneficio', 'Error', { closeButton: true });
      }
    );
  }

  isArray(obj: any): boolean {
    return Array.isArray(obj);
  }
}
