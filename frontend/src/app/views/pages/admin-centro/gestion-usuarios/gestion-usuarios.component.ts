import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
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
  data: any;

  constructor(
    private usuarioService: AuthService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = sessionStorage.getItem('token');
    if (token) {
      this.rolesModulos = this.authService.decodeToken(token).rolesModulos;
    }

    if (this.rolesModulos.length === 0) {
      console.error("No se pudieron obtener los módulos del token");
      return;
    }

    this.adminRolesModulos = this.rolesModulos.filter(rm => rm.rol === 'ADMINISTRADOR');

    if (this.adminRolesModulos.length === 0) {
      console.error("No se encontraron módulos donde el usuario es administrador");
      return;
    }

    this.columns = [
      { header: 'Nombre', col: 'nombreEmpleado', isEditable: true, validationRules: [Validators.required] },
      { header: 'Correo', col: 'correo_1', isEditable: true, validationRules: [Validators.required, Validators.email] },
      { header: 'Estado', col: 'estado' },
      { header: 'Puesto', col: 'nombrePuesto' },
    ];
  }

  onModuloChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedModulo = target?.value;
    const token = sessionStorage.getItem('token');
    if (token) {
      const idCentroTrabajo = this.authService.decodeToken(token).idCentroTrabajo;
      if (selectedModulo) {
        this.selectedModulos = [selectedModulo];
        this.getFilas(selectedModulo, idCentroTrabajo);
      }
    }
  }

  async getFilas(modulo: string, idCentroTrabajo: number) {
    try {
      const data: any = await this.usuarioService.obtenerUsuarioPorModuloYCentroTrabajo(modulo, idCentroTrabajo).toPromise();
      this.data = data;
      this.usuarios = data.map((item: any) => {
        return {
          id: item.id_usuario_empresa,
          nombreEmpleado: item.empleadoCentroTrabajo?.empleado?.nombreEmpleado || 'N/A',
          correo_1: item.empleadoCentroTrabajo?.correo_1 || 'N/A',
          estado: item.estado,
          nombre_centro_trabajo: item.empleadoCentroTrabajo?.centroTrabajo?.nombre_centro_trabajo || 'N/A',
          nombrePuesto: item.empleadoCentroTrabajo?.nombrePuesto || 'N/A',
          municipio: item.empleadoCentroTrabajo?.centroTrabajo?.municipio?.nombre || 'N/A',
          fecha_verificacion: item.fecha_verificacion,
          fecha_modificacion: item.fecha_modificacion,
          fecha_creacion: item.fecha_creacion,
          telefono_1: item.empleadoCentroTrabajo?.empleado?.telefono_1 || 'N/A',
          telefono_2: item.empleadoCentroTrabajo?.empleado?.telefono_2 || 'N/A',
          numero_identificacion: item.empleadoCentroTrabajo?.empleado?.numero_identificacion || 'N/A',
          modulos: item.empleadoCentroTrabajo?.centroTrabajo?.modulos?.map((modulo: any) => modulo.nombre) || [],
          archivo_identificacion: item.empleadoCentroTrabajo?.empleado?.archivo_identificacion ? `data:image/png;base64,${item.empleadoCentroTrabajo.empleado.archivo_identificacion}` : null,
          foto_empleado: item.empleadoCentroTrabajo?.empleado?.foto_empleado ? `data:image/png;base64,${item.empleadoCentroTrabajo.empleado.foto_empleado}` : null,
        };
      });
      this.cargar();
    } catch (error) {
      console.error("Error al obtener datos de Usuarios", error);
    }
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.usuarios).then(() => { });
    }
  }

  manejarRowClick(row: any) {
    const usuarioSeleccionado = this.data.find((usuario: any) => usuario.id_usuario_empresa === row.id);
    this.router.navigate(['/Gestion/editar-perfil', row.id], { state: { usuario: usuarioSeleccionado } });
  }

  irANuevaPagina() {
    this.router.navigate(['/Gestion/nuevo-usuario']);
  }
}
