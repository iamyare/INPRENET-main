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
    'Cargar Beneficios/Deducciones': ['TODO', 'CARGAR BENEFICIOS', 'CARGAR DEDUCCIONES INPREMA', 'CARGAR DEDUCCIONES TERCEROS', 'CALCULO DE PLANILLA'],
    'Ver Planilla Preliminar': ['TODO', 'VER PLANILLA PRELIMINAR'],
    'Ver Planilla Cerrada': ['TODO', 'VER PLANILLA CERRADA']
  };

  constructor(private authService: AuthService, private toastr: ToastrService,) { }

  ngOnInit() {
    this.userRole = this.authService.getRolesModulos();
    this.setStepsAccess();

    // Verificar si el paso actual es accesible
    if (!this.steps[this.currentStep].isActive) {
      const accessibleIndex = this.steps.findIndex(step => step.isActive);
      if (accessibleIndex !== -1) {
        this.currentStep = accessibleIndex;
      } else {
        // En caso de que el usuario no tenga acceso a ningún paso, manejar la situación apropiadamente
        this.toastr.error('No tienes acceso a ninguna sección.');
      }
    }
  }

  setStepsAccess() {
    this.steps = this.steps.map(step => {
      // Obtenemos los roles permitidos para el paso según su etiqueta
      const permittedRoles = this.rolesPermitidos[step.label as keyof typeof this.rolesPermitidos];
      // Verificamos si el usuario posee alguno de esos roles
      const hasAccess = this.userRole.some(userRoleObj => permittedRoles.includes(userRoleObj.rol));
      // Actualizamos la propiedad isActive según si tiene acceso o no
      return { ...step, isActive: hasAccess };
    });
  }

  onStepChange(stepIndex: number) {
    const step = this.steps[stepIndex];

    // Verificamos si el usuario tiene al menos un rol permitido para este paso
    const tieneAcceso = this.userRole.some(userRoleObj => {
      const arrayTemp = this.rolesPermitidos[step.label as keyof typeof this.rolesPermitidos]

      return arrayTemp.includes(userRoleObj.rol)
    }
    );

    if (tieneAcceso) {
      this.currentStep = stepIndex;
    } else {
      this.toastr.warning('Advertencia: No tienes permiso para acceder a esta sección.')
    }
  }
}
