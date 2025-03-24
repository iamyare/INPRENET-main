import { Component, TemplateRef, ViewChild, OnInit } from '@angular/core';
import { PlanillaService } from 'src/app/services/planilla.service';
import { ToastrService } from 'ngx-toastr';
import { BeneficiosService } from 'src/app/services/beneficios.service';
import { MontoDialogComponent } from '../../monto-dialog/monto-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-cargarbef-ded',
  templateUrl: './cargarbef-ded.component.html',
  styleUrls: ['./cargarbef-ded.component.scss']
})
export class CargarbefDedComponent implements OnInit {
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;
  @ViewChild('confirmarAsignacionModal') confirmarAsignacionModal!: TemplateRef<any>;
  @ViewChild('confirmarAsignacionBeneficiariosModal') confirmarAsignacionBeneficiariosModal!: TemplateRef<any>;
  @ViewChild('confirmarCalculoPlanillaModal') confirmarCalculoPlanillaModal!: TemplateRef<any>;
  @ViewChild('confirmarAsignacionComplementariaModal') confirmarAsignacionComplementariaModal!: TemplateRef<any>;
  @ViewChild('confirmarAsignacion60RentasModal') confirmarAsignacion60RentasModal!: TemplateRef<any>;
  @ViewChild('confirmarAsignacionJubiladosModal') confirmarAsignacionJubiladosModal!: TemplateRef<any>;

  tipoPlanilla: any;
  dni: string = '';
  beneficios: any[] = [];
  loading: boolean = false;
  id_planilla: any
  idTipoPlanilla: any

  displayedColumns: string[] = ['causante', 'beneficio', 'select'];
  userRole: { rol: string; modulo: string }[] = []; // Ahora userRole es un array de objetos

  steps = [
    { label: 'Cargar Beneficios', isActive: true },
    { label: 'Cargar Deducciones de Terceros', isActive: false },
    { label: 'Cargar Deducciones de Inprema', isActive: false },
    { label: 'Cálculo de Planilla', isActive: false }
  ];

  rolesPermitidos = {
    'Cargar Beneficios': ['TODO', 'CARGAR BENEFICIOS'],
    'Cargar Deducciones de Terceros': ['TODO', 'CARGAR DEDUCCIONES TERCEROS'],
    'Cargar Deducciones de Inprema': ['TODO', 'CARGAR DEDUCCIONES INPREMA'],
    'Cálculo de Planilla': ['TODO', 'CALCULO DE PLANILLA']
  };
  tieneAcceso: boolean = false;

  constructor(private authService: AuthService, private planillaService: PlanillaService, private toastr: ToastrService, private SVCBeneficios: BeneficiosService, private dialog: MatDialog) { }

  ngOnInit() {
    this.userRole = this.authService.getRolesModulos(); // Obtener el rol del usuario autenticado
  }

  asignarBeneficiosOrdinariaBeneficiariosAfiliados() {
    this.planillaService.generarPlanillaOrdinaria('BENEFICIARIO SIN CAUSANTE,BENEFICIARIO').subscribe({
      next: () => {
        this.toastr.success('Planilla ordinaria generada para Beneficiarios y Afiliados', 'Éxito');
      },
      error: err => {
        this.toastr.error('Error al generar la planilla ordinaria para Beneficiarios y Afiliados', 'Error');
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const event: MatTabChangeEvent = {
        index: this.tabGroup.selectedIndex ?? 0,
        tab: this.tabGroup._tabs.get(this.tabGroup.selectedIndex ?? 0)!
      };
      this.onTabChange(event);
    });
  }



  onTabChange(event: MatTabChangeEvent) {
    const index = this.steps.findIndex(step => step.label === event.tab.textLabel);
    if (index !== -1) {
      const step = this.steps[index];

      const tieneAcceso = this.userRole.some(userRole => {
        return this.rolesPermitidos[step.label as keyof typeof this.rolesPermitidos].includes(userRole.rol);
      });

      this.tieneAcceso = tieneAcceso;
      if (!tieneAcceso) {
        this.toastr.warning("No tiene acceso a esta sección.")
      }

    }
  }

  asignarBeneficiosOrdinariaJubiladosPensionados() {
    this.planillaService.generarPlanillaOrdinaria('JUBILADO,PENSIONADO').subscribe({
      next: () => {
        this.toastr.success('Planilla ordinaria generada para Jubilados y Pensionados', 'Éxito');
      },
      error: err => {
        this.toastr.error('Error al generar la planilla ordinaria para Jubilados y Pensionados', 'Error');
      }
    });
  }

  asignarBeneficiosComplementariaBeneficiariosAfiliados() {
    this.planillaService.generarPlanillaComplementaria('BENEFICIARIO').subscribe({
      next: () => {
        this.toastr.success('Planilla complementaria generada para Beneficiarios y Afiliados', 'Éxito');
      },
      error: err => {
        this.toastr.error('Error al generar la planilla complementaria para Beneficiarios y Afiliados', 'Error');
      }
    });
  }

  asignarBeneficios60Rentas() {
    this.planillaService.generarPlanilla60Rentas('JUBILADO,PENSIONADO', this.id_planilla).subscribe({
      next: () => {
        this.toastr.success('Planilla complementaria generada para Beneficiarios y Afiliados', 'Éxito');
      },
      error: err => {
        this.toastr.error('Error al generar la planilla complementaria para Beneficiarios y Afiliados', 'Error');
      }
    });
  }

  confirmarAsignacionBeneficios(): void {
    const dialogRef = this.dialog.open(this.confirmarAsignacionModal);

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirmar') {
        console.log('Asignación de beneficios confirmada');
        this.asignarBeneficiosOrdinariaJubiladosPensionados(); // Llama a tu método real
      } else {
        console.log('Asignación de beneficios cancelada');
      }
    });
  }


  confirmarAsignacionBeneficiarios(): void {
    const dialogRef = this.dialog.open(this.confirmarAsignacionBeneficiariosModal);

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirmar') {
        console.log('Asignación de beneficios confirmada');
        this.asignarBeneficiosOrdinariaBeneficiariosAfiliados(); // Llama a tu método real
      } else {
        console.log('Asignación de beneficios cancelada');
      }
    });
  }

  confirmarCalculoPlanilla(): void {
    const dialogRef = this.dialog.open(this.confirmarCalculoPlanillaModal);

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirmar') {
        console.log('Asignación de beneficios confirmada');
        this.calculoPlanilla(); // Llama a tu método real
      } else {
        console.log('Asignación de beneficios cancelada');
      }
    });
  }

  calculoPlanilla() {
    this.planillaService.calculoPlanilla(this.id_planilla).subscribe({
      next: () => {
        this.toastr.success('se realizó el cálculo de la planilla de forma correcta', 'Éxito');
      },
      error: err => {
        this.toastr.error('Error en calcular Prioridad', 'Error');
      }
    });
  }

  confirmarAsignacion60Rentas(): void {
    const dialogRef = this.dialog.open(this.confirmarAsignacion60RentasModal);

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirmar') {
        console.log('Asignación de beneficios complementaria confirmada');
        this.asignarBeneficios60Rentas(); // Llama a tu método real
      } else {
        console.log('Asignación de beneficios complementaria cancelada');
      }
    });
  }

  confirmarAsignacionComplementaria(): void {
    const dialogRef = this.dialog.open(this.confirmarAsignacionComplementariaModal);

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirmar') {
        console.log('Asignación de beneficios complementaria confirmada');
        this.asignarBeneficiosComplementariaBeneficiariosAfiliados(); // Llama a tu método real
      } else {
        console.log('Asignación de beneficios complementaria cancelada');
      }
    });
  }

  confirmarAsignacionJubilados(): void {
    const dialogRef = this.dialog.open(this.confirmarAsignacionJubiladosModal);

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirmar') {
        console.log('Asignación de beneficios complementaria a Jubilados confirmada');
        this.asignarBeneficiosComplementariaJubiladosPensionados(); // Llama a tu método real
      } else {
        console.log('Asignación de beneficios complementaria a Jubilados cancelada');
      }
    });
  }

  asignarBeneficiosComplementariaJubiladosPensionados() {
    this.planillaService.generarPlanillaComplementaria('PENSIONADO,JUBILADO,AFILIADO').subscribe({
      next: () => {
        this.toastr.success('Planilla complementaria generada para Jubilados y Pensionados', 'Éxito');
      },
      error: err => {
        this.toastr.error('Error al generar la planilla complementaria para Jubilados y Pensionados', 'Error');
      }
    });
  }

  getElemSeleccionados(event: any) {
    this.idTipoPlanilla = event.idTipoPlanilla;
    this.tipoPlanilla = event.tipoPlanilla;
    this.id_planilla = event.id_planilla;
  }

  buscarBeneficiosPorDni() {
    if (this.dni) {
      this.loading = true;
      this.SVCBeneficios.obtenerCausantesYBeneficios(this.dni).subscribe({
        next: (response) => {
          this.beneficios = this.flattenBeneficios(response);
          this.loading = false;
        },
        error: (err) => {
          this.toastr.error('Error al buscar beneficios', 'Error');
          this.loading = false;
        }
      });
    } else {
      this.toastr.warning('Por favor, ingrese un DNI', 'Advertencia');
    }
  }

  flattenBeneficios(causantes: any[]): any[] {
    let beneficiosAplanados: any[] = [];

    causantes.forEach(causante => {
      causante.beneficios.forEach((beneficio: any) => {
        beneficiosAplanados.push({
          causante: causante.causante,
          beneficio: beneficio.beneficio,
          detalleBeneficio: beneficio
        });
      });
    });
    return beneficiosAplanados;
  }

  seleccionarBeneficio(beneficio: any) {
    const dialogRef = this.dialog.open(MontoDialogComponent, {
      width: '250px',
      data: { monto_a_pagar: 0 }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        const data = {
          id_persona: beneficio.detalleBeneficio.ID_PERSONA,
          id_causante: beneficio.detalleBeneficio.ID_CAUSANTE,
          id_detalle_persona: beneficio.detalleBeneficio.ID_DETALLE_PERSONA,
          id_beneficio: beneficio.detalleBeneficio.ID_BENEFICIO,
          id_planilla: this.id_planilla, // Usa el id_planilla obtenido
          monto_a_pagar: result.monto_a_pagar
        };
        this.SVCBeneficios.insertarDetallePagoBeneficio(data).subscribe({
          next: () => {
            this.toastr.success('Detalle de pago insertado correctamente.');
          },
          error: (error) => {
            console.error('Error al insertar detalle del pago del beneficio', error);
            this.toastr.error('Error al insertar el detalle del pago.');
          }
        });
      }
    });
  }


}
