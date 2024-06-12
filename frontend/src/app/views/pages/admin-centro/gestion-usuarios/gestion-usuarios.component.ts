import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';

@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.scss']
})
export class GestionUsuariosComponent implements OnInit {
  rolesModulos: { rol: string, modulo: string }[] = [];
  adminRolesModulos: { rol: string, modulo: string }[] = [];
  selectedModulos: string[] = [];
  public columns: TableColumn[] = [];
  public usuarios: any[] = [];
  ejecF: any;

  constructor(
    private usuarioService: AuthService,
    private authService: AuthService,
    private centrosTrabajoService: CentroTrabajoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.rolesModulos = this.authService.getRolesModulos();

    if (this.rolesModulos.length === 0) {
      console.error("No se pudieron obtener los módulos del token");
      return;
    }
    // Filtra los módulos donde el usuario es administrador
    this.adminRolesModulos = this.rolesModulos.filter(rm => rm.rol === 'ADMINISTRADOR');

    if (this.adminRolesModulos.length === 0) {
      console.error("No se encontraron módulos donde el usuario es administrador");
      return;
    }

    // Preselecciona todos los módulos donde es administrador
    this.selectedModulos = this.adminRolesModulos.map(rm => rm.modulo);

    this.columns = [
      { header: 'Nombre', col: 'nombreEmpleado', isEditable: true, validationRules: [Validators.required] },
      { header: 'Correo', col: 'correo_1', isEditable: true, validationRules: [Validators.required, Validators.email] },
      { header: 'Estado', col: 'estado' },
      { header: 'Centro de Trabajo', col: 'nombre_centro_trabajo' },
      { header: 'Puesto', col: 'nombrePuesto' },
    ];

    this.getFilas().then(() => this.cargar());
  }

  onModuloChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedModulo = target?.value;
    if (selectedModulo) {
      this.selectedModulos = [selectedModulo];
      this.getFilas().then(() => this.cargar());
    }
  }

  getFilas = async () => {
    if (this.selectedModulos.length === 0) {
      console.error("No se pudo obtener los módulos seleccionados");
      return;
    }

    try {
      const data: any = await this.usuarioService.obtenerUsuariosPorModulos(this.selectedModulos).toPromise();
      this.usuarios = data.map((item: any) => {
        return {
          id: item.id_usuario_empresa,
          nombreEmpleado: item.empleadoCentroTrabajo?.empleado?.nombreEmpleado || 'N/A',
          correo_1: item.empleadoCentroTrabajo?.correo_1 || 'N/A',
          estado: item.estado,
          nombre_centro_trabajo: item.empleadoCentroTrabajo?.centroTrabajo?.nombre_centro_trabajo || 'N/A',
          nombrePuesto: item.empleadoCentroTrabajo?.nombrePuesto || 'N/A'
        };
      });

      return this.usuarios;
    } catch (error) {
      console.error("Error al obtener datos de Usuarios", error);
      throw error;
    }
  };

  editarUsuario = (row: any) => {
    console.log('Editar usuario:', row);
  };

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.usuarios).then(() => { });
    }
  }

  manejarEliminar(row: any) {
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
