import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-gestion-banco',
  templateUrl: './gestion-banco.component.html',
  styleUrls: ['./gestion-banco.component.scss']
})
export class GestionBancoComponent {
  public dniAfiliado: string = ''; // El DNI que será pasado al componente EditDatosBancariosComponent
  public afiliado: any = null;     // Esto solo almacenará el DNI
  public errorMessage: string | null = null; // Para mostrar mensajes de error

  constructor(
    private toastr: ToastrService
  ) {}

  buscarAfiliado() {
    if (!this.dniAfiliado || this.dniAfiliado.length < 13) {
      this.errorMessage = 'El DNI debe tener al menos 13 caracteres.';
      this.toastr.error('El DNI debe tener al menos 13 caracteres.', 'Error');
      return;
    }

    // Actualizamos el valor de afiliado con el DNI ingresado
    this.afiliado = { n_identificacion: this.dniAfiliado };
    this.errorMessage = null;
    this.toastr.success('DNI asignado correctamente.', 'Éxito');
  }

  resetBusqueda() {
    this.afiliado = null;
    this.dniAfiliado = '';
    this.errorMessage = null;
  }
}
