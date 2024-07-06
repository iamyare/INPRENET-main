import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-beneficiario-beneficios-asignados',
  templateUrl: './beneficiario-beneficios-asignados.component.html',
  styleUrls: ['./beneficiario-beneficios-asignados.component.scss']
})
export class BeneficiarioBeneficiosAsignadosComponent implements OnInit {
  @Input() datos: any;
  @ViewChild('historialDialog') historialDialog!: TemplateRef<any>;
  historialPagos: any[] = [];

  beneficios = [
    {
      nombreBeneficio: 'SEPARACION DEL SISTEMA VOLUNTARIO',
      monto: 'L 5,000',
      causante: 'Juan Carlos Pérez Gómez'
    },
    {
      nombreBeneficio: 'PENSION POR VEJEZ',
      monto: 'L 2,500',
      causante: 'Juan Carlos Pérez Gómez'
    },
    {
      nombreBeneficio: 'SEGURO DE VIDA Y SEPARACION',
      monto: 'L 1,200',
      causante: 'Juan Carlos Pérez Gómez'
    }
  ];

  constructor(private modalService: NgbModal) {}

  ngOnInit() {
    /* console.log(this.datos); */
  }

  openHistorial(beneficio: any) {
    // Aquí puedes cargar el historial de pagos del beneficio seleccionado
    this.historialPagos = [
      { fecha: '01/01/2024', monto: 'L 500' },
      { fecha: '01/02/2024', monto: 'L 500' },
      { fecha: '01/03/2024', monto: 'L 500' }
    ];

    this.modalService.open(this.historialDialog);
  }
}
