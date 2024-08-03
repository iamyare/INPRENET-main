import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-desglose',
  templateUrl: './dialog-desglose.component.html',
  styleUrls: ['./dialog-desglose.component.scss']
})
export class DialogDesgloseComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    // Puedes realizar alguna inicialización aquí si es necesario
  }

  isArray(obj: any): boolean {
    return Array.isArray(obj);
  }
}
