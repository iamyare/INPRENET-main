import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CentrosTrabajoService } from 'src/app/services/centros-trabajo.service';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';

@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.scss']
})
export class GestionUsuariosComponent implements OnInit {
  centroTrabajoId: number | null = null;
  nombreCentroTrabajo: string = '';
  public columns: TableColumn[] = [];
  public usuarios: any[] = [];
  ejecF: any;

  constructor(
    private usuarioService: AuthService,
    private authService: AuthService,
    private centrosTrabajoService: CentrosTrabajoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.centroTrabajoId = this.authService.getCentroTrabajoId();
    if (this.centroTrabajoId === null) {
      console.error("No se pudo obtener el centro de trabajo del token");
      return;
    }

    this.columns = [
      { header: 'Nombre', col: 'nombreEmpleado', isEditable: true, validationRules: [Validators.required] },
      { header: 'Correo', col: 'correo_1', isEditable: true, validationRules: [Validators.required, Validators.email] },
      { header: 'Estado', col: 'estado' },
      { header: 'Centro de Trabajo', col: 'nombre_centro_trabajo' },
      { header: 'Puesto', col: 'nombrePuesto' },
    ];

    this.centrosTrabajoService.getCentroTrabajoById(this.centroTrabajoId).subscribe({
      next: (data) => {
        this.nombreCentroTrabajo = data.nombre_centro_trabajo;
      },
      error: (err) => {
        console.error('Error al obtener el nombre del centro de trabajo:', err);
      }
    });

    this.getFilas().then(() => this.cargar());
  }

  getFilas = async () => {
    if (this.centroTrabajoId === null) {
      console.error("No se pudo obtener el centro de trabajo del token");
      return;
    }

    try {
      const data = await this.usuarioService.getUsuariosPorCentro(this.centroTrabajoId).toPromise();
      this.usuarios = data.map((item: any) => {
        return {
          id: item.id_usuario_empresa,
          nombreEmpleado: item.empleadoCentroTrabajo.empleado.nombreEmpleado,
          correo_1: item.empleadoCentroTrabajo.correo_1,
          estado: item.estado,
          nombre_centro_trabajo: item.empleadoCentroTrabajo.centroTrabajo.nombre_centro_trabajo,
          nombrePuesto: item.empleadoCentroTrabajo.nombrePuesto
        };
      });

      return this.usuarios;
    } catch (error) {
      console.error("Error al obtener datos de Usuarios", error);
      throw error;
    }
  };

  editarUsuario = (row: any) => {
    // Implementa la lógica para editar el usuario aquí
    console.log('Editar usuario:', row);
  };

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.usuarios).then(() => {
      });
    }
  }

  manejarEliminar(row: any) {
    // Implementa la lógica para manejar la eliminación del usuario aquí
    console.log('Eliminar usuario:', row);
    const index = this.usuarios.findIndex(usuario => usuario.id === row.id);
    if (index !== -1) {
      this.usuarios.splice(index, 1);
      this.cargar();
    }
  }

  manejarEditar(row: any) {
    console.log('Editar usuario:', row);
    this.editarUsuario(row);
  }

  irANuevaPagina() {
    this.router.navigate(['/Gestion/nuevo-usuario']);
  }
}
