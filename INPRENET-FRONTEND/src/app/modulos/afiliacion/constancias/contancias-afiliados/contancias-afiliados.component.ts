import { Component, Input, OnInit } from '@angular/core';
import { AfiliadoService } from '../../../../services/afiliado.service';
import { unirNombres } from '../../../../../../src/app/shared/functions/formatoNombresP';
import { AuthService } from '../../../../services/auth.service';
import { DialogSuboptionsComponent } from '../dialog-suboptions/dialog-suboptions.component';
import { MatDialog } from '@angular/material/dialog';
import { BeneficiosService } from '../../../../services/beneficios.service';
import { DireccionService } from '../../../../services/direccion.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contancias-afiliados',
  templateUrl: './contancias-afiliados.component.html',
  styleUrls: ['./contancias-afiliados.component.scss'],
})
export class ContanciasAfiliadosComponent implements OnInit {
  @Input() persona: any = null;
  unirNombres: any = unirNombres;
  usuarioToken: {
    correo: string;
    numero_empleado: string;
    departamento: string;
    municipio: string;
    nombrePuesto: string;
    nombreEmpleado: string;
  } | null = null;

  constanciaButtons = [
    { label: 'Generar Constancia de Afiliación', allowedTypes: ['AFILIADO', 'JUBILADO', 'PENSIONADO'] },
    { label: 'Generar Constancia de Beneficio', allowedTypes: ['AFILIADO', 'JUBILADO', 'PENSIONADO'] },
  ];

  filteredConstanciaButtons: any = [];
  beneficios: any[] = [];

  constructor(
    private afiliadoService: AfiliadoService,
    private authService: AuthService,
    private dialog: MatDialog,
    private beneficiosService: BeneficiosService,
    private direccionService: DireccionService,
    private toastr: ToastrService 
  ) {}

  ngOnInit(): void {
    this.obtenerDatosDesdeToken();
    this.filtrarConstanciasPorTipoPersona();
  }

  private obtenerDatosDesdeToken(): void {
    const token = sessionStorage.getItem('token');
    if (token) {
      const dataToken = this.authService.decodeToken(token);
      this.usuarioToken = {
        correo: dataToken.correo,
        numero_empleado: dataToken.numero_empleado,
        departamento: dataToken.departamento,
        municipio: dataToken.municipio,
        nombrePuesto: dataToken.nombrePuesto,
        nombreEmpleado: dataToken.nombreEmpleado,
      };
    } else {
      console.warn('No se encontró un token en sessionStorage.');
    }
  }

  private filtrarConstanciasPorTipoPersona(): void {
    if (this.persona?.TIPOS_PERSONA) {
      const tiposPersona = this.persona.TIPOS_PERSONA;
      this.filteredConstanciaButtons = this.constanciaButtons.filter((button) =>
        button.allowedTypes.some((type) => tiposPersona.includes(type))
      );
    } else {
      this.filteredConstanciaButtons = [];
    }
  }

  onPersonaEncontrada(persona: any): void {
    this.persona = persona;
    this.filtrarConstanciasPorTipoPersona();
    this.obtenerBeneficiosPorPersona(persona.N_IDENTIFICACION);
  }

  onResetBusqueda(): void {
    this.persona = null;
    this.filteredConstanciaButtons = [];
    this.beneficios = [];
  }

  private obtenerBeneficiosPorPersona(dni: string): void {
    const nombresExcluidos = [
        '60 RENTAS',
        'DECIMO TERCERO',
        'DECIMO CUARTO',
        'COSTO DE VIDA'
    ];
    this.beneficiosService.GetAllBeneficios(dni).subscribe(
        (response) => {
            this.beneficios = response?.detBen
                ?.filter((item: any) => !nombresExcluidos.includes(item.beneficio?.nombre_beneficio))
                .map((item: any) => item.beneficio?.nombre_beneficio) || [];
        },
        (error) => {
            console.error('Error al obtener los beneficios:', error);
        }
    );
  }

  onConstanciaClick(event: { label: string; params?: any }): void {
    const selectedConstanciaLabel = event.label;
    const params = event.params;
  
    if (selectedConstanciaLabel === 'Generar Constancia de Beneficio') {
      if (this.beneficios.length > 0) {
        this.openSubOptionsDialog(this.beneficios);
      } else {
        this.toastr.warning(
          'No hay beneficios disponibles para esta persona.',
          'Advertencia'
        );
      }
    } else if (selectedConstanciaLabel === 'Generar Constancia de Afiliación') {
      this.generarConstanciaAfiliacion();
    }
  }
  
  private generarNombreArchivo(persona: any, tipo: string): string {
    const nombreCompleto = `${persona.PRIMER_NOMBRE}_${persona.PRIMER_APELLIDO}_${persona.N_IDENTIFICACION}`;
    const fechaActual = new Date().toISOString().split('T')[0];
    return `${nombreCompleto}_${fechaActual}_constancia_${tipo}.pdf`;
  }

  private manejarDescarga(blob: Blob, nombreArchivo: string): void {
    const downloadURL = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadURL;
    link.download = nombreArchivo;
    link.click();
    window.URL.revokeObjectURL(downloadURL);
  }

  generarConstanciaAfiliacion(): void {
    const data = this.prepararDatosConstancia(this.persona);
    const dto = this.usuarioToken;

    if (!dto || !dto.numero_empleado || !dto.departamento || !dto.municipio || !dto.nombrePuesto) {
      console.error('Faltan datos del usuario en el token:', dto);
      return;
    }

    this.afiliadoService.generarConstanciaQR(data, dto, 'afiliacion').subscribe(
      (blob: Blob) => {
        const nombreArchivo = this.generarNombreArchivo(this.persona, 'afiliacion');
        this.manejarDescarga(blob, nombreArchivo);
      },
      (error) => {
        console.error('Error al generar la constancia:', error);
      }
    );
  }

  private prepararDatosConstancia(persona: any): any {
    return {
      primer_nombre: persona.PRIMER_NOMBRE,
      segundo_nombre: persona.SEGUNDO_NOMBRE,
      tercer_nombre: persona.TERCER_NOMBRE,
      primer_apellido: persona.PRIMER_APELLIDO,
      segundo_apellido: persona.SEGUNDO_APELLIDO,
      n_identificacion: persona.N_IDENTIFICACION,
    };
  }

  openSubOptionsDialog(options: string[]): void {
    const dialogRef = this.dialog.open(DialogSuboptionsComponent, {
      width: '400px',
      data: { options },
    });
  
    dialogRef.afterClosed().subscribe((selectedOption) => {
      if (selectedOption) {
        this.generateConstanciaBeneficio(selectedOption);
      } else {
        console.log('El usuario cerró el diálogo sin seleccionar.');
      }
    });
  }

  generateConstanciaBeneficio(beneficio: any): void {
    if (typeof beneficio === 'object' && beneficio?.selectedOption) {
      beneficio = beneficio.selectedOption;
    }
  
    if (typeof beneficio !== 'string') {
      console.error('El valor de beneficio no es una cadena:', beneficio);
      return;
    }
  
    const beneficioClean = beneficio.trim().toUpperCase();
    const departamentoId = this.persona?.id_departamento_residencia;
  
    this.direccionService.getAllDepartments().subscribe(
      (departamentos: { id_departamento: number; nombre_departamento: string }[]) => {
        const departamento = departamentoId
          ? departamentos.find(dep => dep.id_departamento === departamentoId)
          : { nombre_departamento: 'NO DEFINIDO' };
  
        this.beneficiosService.GetAllBeneficios(this.persona.N_IDENTIFICACION).subscribe(
          (response) => {
            if (!response || !response.detBen) {
              console.error('Error: La respuesta del servicio de beneficios es inválida', response);
              return;
            }
  
            const beneficioEncontrado = response.detBen.find(
              (item: any) => item.beneficio?.nombre_beneficio.trim().toUpperCase() === beneficioClean
            );
  
            if (!beneficioEncontrado) {
              console.error(`No se encontró el beneficio seleccionado (${beneficioClean}) en el response.`, response.detBen);
              return;
            }
  
            const monto = beneficioEncontrado.monto_por_periodo || 0;
            const fechaInicio = beneficioEncontrado.periodo_inicio || 'Fecha no definida';
  
            const data = {
              nombre_completo: `${this.persona.PRIMER_NOMBRE} ${this.persona.SEGUNDO_NOMBRE || ''} ${this.persona.PRIMER_APELLIDO} ${this.persona.SEGUNDO_APELLIDO || ''}`.trim(),
              n_identificacion: this.persona.N_IDENTIFICACION,
              beneficio: beneficioEncontrado.beneficio?.nombre_beneficio,
              departamento: departamento?.nombre_departamento || 'NO DEFINIDO',
              monto: monto,
              monto_letras: this.convertirNumeroALetrasConCentavos(monto),
              fecha_inicio: this.convertirFechaAPalabras(fechaInicio),
            };
  
            const dto = this.usuarioToken;
  
            if (!dto || !dto.numero_empleado || !dto.departamento || !dto.municipio || !dto.nombrePuesto) {
              console.error('Faltan datos del usuario en el token:', dto);
              return;
            }
  
            // Llama al servicio para generar la constancia
            this.afiliadoService.generarConstanciaQR(data, dto, 'beneficios').subscribe(
              (blob: Blob) => {
                const nombreArchivo = this.generarNombreArchivo(this.persona, 'beneficio');
                this.manejarDescarga(blob, nombreArchivo);
              },
              (error) => {
                console.error('Error al generar la constancia de beneficio:', error);
              }
            );
          },
          (error) => {
            console.error('Error al obtener los beneficios:', error);
          }
        );
      },
      (error) => {
        console.error('Error al cargar los departamentos:', error);
      }
    );
  }
  

  private convertirNumeroALetrasConCentavos(monto: number): string {
    if (isNaN(monto) || monto === null || monto === undefined) {
      console.error('El monto proporcionado no es válido:', monto);
      return 'CERO LEMPIRAS';
    }

    const unidades = [
      '', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'
    ];
    const especiales = [
      'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'
    ];
    const decenas = [
      '', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'
    ];
    const centenas = [
      '', 'CIEN', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'
    ];

    function convertirSeccion(numero: number): string {
      let texto = '';

      if (numero >= 100) {
        const centena = Math.floor(numero / 100);
        texto += centenas[centena] + ' ';
        numero %= 100;
      }

      if (numero >= 20) {
        const decena = Math.floor(numero / 10);
        texto += decenas[decena] + ' ';
        numero %= 10;
      } else if (numero >= 10) {
        texto += especiales[numero - 10] + ' ';
        numero = 0;
      }

      if (numero > 0) {
        texto += unidades[numero];
      }

      return texto.trim();
    }

    function convertirMiles(numero: number): string {
      if (numero === 0) return '';
      if (numero === 1) return 'MIL';
      return convertirSeccion(numero) + ' MIL';
    }

    function convertirMillones(numero: number): string {
      if (numero === 0) return '';
      if (numero === 1) return 'UN MILLÓN';
      return convertirSeccion(numero) + ' MILLONES';
    }

    const millones = Math.floor(monto / 1000000);
    const miles = Math.floor((monto % 1000000) / 1000);
    const resto = Math.floor(monto % 1000);
    const centavos = Math.round((monto % 1) * 100);

    let resultado = '';

    if (millones > 0) {
      resultado += convertirMillones(millones) + ' ';
    }

    if (miles > 0) {
      resultado += convertirMiles(miles) + ' ';
    }

    if (resto > 0) {
      resultado += convertirSeccion(resto);
    }

    if (centavos > 0) {
      resultado += ` CON ${centavos}/100 CENTAVOS`;
    }

    return resultado.trim() + ' LEMPIRAS';
  }

  private convertirFechaAPalabras(fecha: string): string {
    if (!fecha) {
      console.error('Fecha no proporcionada');
      return 'Fecha no válida';
    }

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const partesFecha = fecha.split('-');
    if (partesFecha.length !== 3) {
      console.error('Formato de fecha inválido:', fecha);
      return 'Fecha no válida';
    }

    const anio = partesFecha[0];
    const mes = meses[parseInt(partesFecha[1], 10) - 1];
    const dia = parseInt(partesFecha[2], 10);

    return `${dia} de ${mes} del ${anio}`;
  }
}
