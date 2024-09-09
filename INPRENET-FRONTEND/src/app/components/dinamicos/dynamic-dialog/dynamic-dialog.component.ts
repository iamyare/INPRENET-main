import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { DeduccionesService } from 'src/app/services/deducciones.service';

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

  displayedColumnsB: string[] = ['CODIGO', 'NOMBRE_BENEFICIO', 'MontoAPagar'];
  displayedColumnsD: string[] = ['NOMBRE_INSTITUCION', 'NOMBRE_DEDUCCION', 'MontoAplicado', 'accion'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { logs: any[] }, private deduccionSVC: DeduccionesService, private toastr: ToastrService,
  private dialogRef: MatDialogRef<DynamicDialogComponent>) { }

  ngOnInit() {
    this.dialogTitle = this.titulo || 'Desglose';
  }

  accionDeduccion(element: any) {
    const toastrRef = this.toastr.success('Deducción eliminada con éxito', 'Éxito', {
      closeButton: true,
    });

    this.deduccionSVC.eliminarDetalleDeduccion(element.ID_DED_DEDUCCION).subscribe(
      (response) => {
        this.toastr.success('Deducción eliminada con éxito', 'Éxito', {
          closeButton: true,
        });
        this.dialogRef.close();
        this.deduccionEliminada.emit();
      },
      (error) => {
        this.toastr.error('Error al eliminar la deducción', 'Error', {
          closeButton: true,
        });
      }
    );
  }

  isArray(obj: any): boolean {
    return Array.isArray(obj);
  }
}
