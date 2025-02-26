import { AuthService } from 'src/app/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-proceso-planilla',
  templateUrl: './proceso-planilla.component.html',
  styleUrls: ['./proceso-planilla.component.scss']
})
export class ProcesoPlanillaComponent implements OnInit {
  currentStep: number = 0;
  title: string = 'Proceso de Planilla';
  userRole: { rol: string; modulo: string }[] = []; // Ahora userRole es un array de objetos

  steps = [
    { label: 'Nueva Planilla', isActive: true },
    { label: 'Cargar Beneficios/Deducciones', isActive: false },
    { label: 'Ver Planilla Preliminar', isActive: false },
    { label: 'Ver Planilla Cerrada', isActive: false }
  ];

  rolesPermitidos = {
    'Nueva Planilla': ['TODO', 'CREAR PLANILLA'],
    'Cargar Beneficios/Deducciones': ['TODO', 'CARGAR BENEFICIOS DEDUCCIONES'],
    'Ver Planilla Preliminar': ['TODO', 'VER PLANILLA PRELIMINAR'],
    'Ver Planilla Cerrada': ['TODO', 'VER PLANILLA CERRADA']
  };

  constructor(private authService: AuthService, private toastr: ToastrService,) { }

  ngOnInit() {
    this.userRole = this.authService.getRolesModulos(); // Obtener el rol del usuario autenticado
  }

  onStepChange(stepIndex: number) {
    const step = this.steps[stepIndex];

    // Verificamos si el usuario tiene al menos un rol permitido para este paso
    const tieneAcceso = this.userRole.some(userRoleObj =>
      this.rolesPermitidos[step.label as keyof typeof this.rolesPermitidos].includes(userRoleObj.rol)
    );

    if (tieneAcceso) {
      this.currentStep = stepIndex;
    } else {
      this.toastr.warning('Advertencia: No tienes permiso para acceder a esta sección.')
    }
  }
}
