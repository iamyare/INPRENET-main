import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dynamic-dialog',
  templateUrl: './dynamic-dialog.component.html',
  styleUrls: ['./dynamic-dialog.component.scss']
})
export class DynamicDialogComponent implements OnInit {

  @Input() titulo = "";
  @Input() subtitulo = "";
  dialogTitle: string = ''; // Título del diálogo

  displayedColumnsB: string[] = []; // Dejar esto vacío inicialmente
  displayedColumnsD: string[] = []; // Dejar esto vacío inicialmente

  constructor(@Inject(MAT_DIALOG_DATA) public data: { logs: any[] }) { }

  ngOnInit() {
    console.log(this.data);

    for (let i = 0; i < this.data.logs.length; i++) {
      const element = this.data.logs[i];
      console.log(element);

      if (element.type == 'beneficios') {
        this.displayedColumnsB = ['NOMBRE_BENEFICIO', 'MontoAPagar'];
      }
      if (element.type == 'deducciones') {
        this.displayedColumnsD = ['NOMBRE_DEDUCCION', 'MontoAplicado'];
      }
    }

  }

  isArray(obj: any): boolean {
    return Array.isArray(obj);
  }
}
