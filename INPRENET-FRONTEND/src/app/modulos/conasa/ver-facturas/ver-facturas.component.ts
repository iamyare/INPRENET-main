import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConasaService } from '../../../services/conasa.service';

@Component({
  selector: 'app-ver-facturas',
  templateUrl: './ver-facturas.component.html',
  styleUrls: ['./ver-facturas.component.scss'],
})
export class VerFacturasComponent implements OnInit {
  facturas: any[] = [];
  tipoFactura: number = 0;

  constructor(
    private conasaService: ConasaService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarFacturas();
  }

  cargarFacturas(): void {
    this.conasaService.listarFacturas(this.tipoFactura).subscribe({
      next: (facturas) => {
        this.facturas = facturas;
      },
      error: (err) => {
        this.toastr.error('Error al cargar las facturas.', 'Error');
        console.error(err);
      },
    });
  }

  visualizarFactura(id: number): void {
    this.conasaService.visualizarFactura(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      },
      error: (err) => {
        this.toastr.error('Error al visualizar la factura.', 'Error');
        console.error(err);
      },
    });
  }

  descargarFactura(id: number): void {
    this.conasaService.descargarFactura(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `factura_${id}.pdf`;
        link.click();
      },
      error: (err) => {
        this.toastr.error('Error al descargar la factura.', 'Error');
        console.error(err);
      },
    });
  }

  eliminarFactura(id: number): void {
    this.conasaService.eliminarFactura(id).subscribe({
      next: () => {
        this.toastr.success('Factura eliminada exitosamente.', 'Éxito');
        this.cargarFacturas();
      },
      error: (err) => {
        const mensaje = err.message.includes('dentro de las primeras 24 horas')
          ? 'No se puede eliminar la factura porque ha pasado el límite de 24 horas.'
          : 'Error al eliminar la factura.';
        this.toastr.error(mensaje, 'Error');
        console.error('Error al eliminar la factura:', err);
      },
    });
  }
  
}
