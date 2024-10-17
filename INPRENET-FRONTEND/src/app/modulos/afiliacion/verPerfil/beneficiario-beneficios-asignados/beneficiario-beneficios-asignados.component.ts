import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BeneficiosService } from 'src/app/services/beneficios.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-beneficiario-beneficios-asignados',
  templateUrl: './beneficiario-beneficios-asignados.component.html',
  styleUrls: ['./beneficiario-beneficios-asignados.component.scss']
})
export class BeneficiarioBeneficiosAsignadosComponent implements OnInit {
  @Input() datos: any;
  @ViewChild('historialDialog') historialDialog!: TemplateRef<any>;
  historialPagos: any[] = [];
  beneficiosPorCausante: any[] = [];

  constructor(
    private beneficiosService: BeneficiosService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    if (this.datos && this.datos.n_identificacion) {
      this.cargarBeneficios(this.datos.n_identificacion);
    }
  }

  cargarBeneficios(dni: string) {
    this.beneficiosService.obtenerCausantesYBeneficios(dni).subscribe({
      next: (res) => {
        this.beneficiosPorCausante = res || [];
      },
      error: (err) => {
        this.beneficiosPorCausante = [];
        this.toastr.error('Error al cargar los beneficios', 'Error');
      }
    });
  }

  verHistorial(beneficio: any, causante: any) {
    const { n_identificacion } = this.datos;
    const causanteIdentificacion = causante.n_identificacion;
    const idBeneficio = beneficio.beneficio.id_beneficio;
    this.beneficiosService.obtenerDetallePagoConPlanilla(n_identificacion, causanteIdentificacion, idBeneficio).subscribe({
      next: (res) => {
        if (res.length > 0) {
          this.historialPagos = res;
          this.modalService.open(this.historialDialog);
        } else {
          this.toastr.warning('No se encontraron detalles de pago para este beneficio.');
        }
      },
      error: (err) => {
        this.toastr.error(err || 'Error al cargar el historial de pagos', 'Error');
      }
    });
  }
}
