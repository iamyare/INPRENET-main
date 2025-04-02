import { Component, Input, OnInit } from '@angular/core';
import { AfiliadoService } from '../../../../services/afiliado.service';
import { unirNombres } from '../../../../../../src/app/shared/functions/formatoNombresP';
import { AuthService } from '../../../../services/auth.service';
import { DialogSuboptionsComponent } from '../dialog-suboptions/dialog-suboptions.component';
import { MatDialog } from '@angular/material/dialog';
import { BeneficiosService } from '../../../../services/beneficios.service';
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
  beneficiosConPeriodicidadV: string[] = [];
  beneficiosSinPeriodicidadV: string[] = [];

  constanciaButtons = [
    { label: 'Constancia de Afiliación', allowedTypes: ['AFILIADO', 'JUBILADO', 'PENSIONADO'] },
    { label: 'Constancia de Jubilados/Pensionados', allowedTypes: ['AFILIADO', 'JUBILADO', 'PENSIONADO'] },
    { label: 'Constancia de Beneficio', allowedTypes: ['AFILIADO', 'JUBILADO', 'PENSIONADO', 'BENEFICIARIO', 'DESIGNADO', 'BENEFICIARIO SIN CAUSANTE'] },
    { label: 'Constancia de Jubilado Fallecido', allowedTypes: ['AFILIADO', 'JUBILADO', 'PENSIONADO'] },
    { label: 'Constancia de Beneficiarios Sin Pago', allowedTypes: ['AFILIADO', 'JUBILADO', 'PENSIONADO'] },
  ];

  filteredConstanciaButtons: any = [];
  beneficios: any[] = [];

  constructor(
    private afiliadoService: AfiliadoService,
    private authService: AuthService,
    private dialog: MatDialog,
    private beneficiosService: BeneficiosService,
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
    this.beneficiosService.obtenerBeneficiosPorPersona(dni).subscribe(
      (response) => {
        if (!response || response.length === 0) {
          this.toastr.warning('No se encontraron beneficios para esta persona.', 'Aviso');
          return;
        }
  
        this.beneficiosConPeriodicidadV = [];
        this.beneficiosSinPeriodicidadV = [];
        this.beneficios = response;
  
        response.forEach((beneficio: any) => {
          if (beneficio.PERIODICIDAD?.trim() === 'V') {
            this.beneficiosConPeriodicidadV.push(beneficio.NOMBRE_BENEFICIO);
          } else {
            this.beneficiosSinPeriodicidadV.push(beneficio.NOMBRE_BENEFICIO);
          }
        });
      },
      (error) => {
        console.error('Error al obtener los beneficios:', error);
      }
    );
  }
  
  onConstanciaClick(event: { label: string; params?: any }): void {
    const selectedConstanciaLabel = event.label;
  
    // 🔹 "Constancia de Jubilado Fallecido" - EXCLUIR COSTO DE VIDA
    if (selectedConstanciaLabel === 'Constancia de Jubilado Fallecido') {
      if (this.persona.fallecido !== 'SI') {
        this.toastr.warning('No se puede generar esta constancia porque la persona no está fallecida.', 'Advertencia');
        return;
      }
  
      this.beneficiosService.obtenerBeneficiosPorPersona(this.persona.N_IDENTIFICACION, false).subscribe(
        (response) => {
          if (!response || response.length === 0) {
            this.toastr.warning('No hay beneficios disponibles para esta persona.', 'Advertencia');
            return;
          }
  
          this.beneficios = response;
          const beneficiosNombres = response.map((b: any) => b.NOMBRE_BENEFICIO);
          this.openSubOptionsDialog(beneficiosNombres, this.generateConstanciaJubiladoFallecido.bind(this));
        },
        (error) => {
          console.error('Error al obtener los beneficios sin costo de vida:', error);
        }
      );
    } 
    else {
      // 🔹 Para TODAS las demás constancias - INCLUIR COSTO DE VIDA
      this.beneficiosService.obtenerBeneficiosPorPersona(this.persona.N_IDENTIFICACION, true).subscribe(
        (response) => {
          if (!response || response.length === 0) {
            this.toastr.warning('No hay beneficios disponibles para esta persona.', 'Advertencia');
            return;
          }
  
          this.beneficios = response;
          this.beneficiosConPeriodicidadV = [];
          this.beneficiosSinPeriodicidadV = [];
  
          response.forEach((beneficio: any) => {
            if (beneficio.PERIODICIDAD?.trim() === 'V') {
              this.beneficiosConPeriodicidadV.push(beneficio.NOMBRE_BENEFICIO);
            } else {
              this.beneficiosSinPeriodicidadV.push(beneficio.NOMBRE_BENEFICIO);
            }
          });
  
          if (selectedConstanciaLabel === 'Constancia de Jubilados/Pensionados') {
            if (this.beneficiosConPeriodicidadV.length > 0) {
              this.openSubOptionsDialog(this.beneficiosConPeriodicidadV, this.generateConstanciaBeneficio.bind(this));
            } else {
              this.toastr.warning('No hay beneficios disponibles con periodicidad "VITALICIO".', 'Advertencia');
            }
          } 
          else if (selectedConstanciaLabel === 'Constancia de Afiliación') {
            this.generarConstanciaAfiliacion();
          } 
          else if (selectedConstanciaLabel === 'Constancia de Beneficiarios Sin Pago') {
            this.generateConstanciaBeneficiariosSinPago();
          } 
          else if (selectedConstanciaLabel === 'Constancia de Beneficio') {
            if (this.beneficiosSinPeriodicidadV.length > 0) {
              this.openSubOptionsDialog(this.beneficiosSinPeriodicidadV, this.generateNuevaConstanciaBeneficio.bind(this));
            } else {
              this.toastr.warning('No hay beneficios disponibles.', 'Advertencia');
            }
          }
        },
        (error) => {
          console.error('Error al obtener los beneficios con costo de vida:', error);
        }
      );
    }
  }
  
  
  generateNuevaConstanciaBeneficio(beneficio: any): void {
    console.log('Beneficio seleccionado:', beneficio);
    
    if (typeof beneficio === 'object' && beneficio.selectedOption) {
      beneficio = beneficio.selectedOption;
    }
    if (typeof beneficio !== 'string') {
      console.error('El valor de beneficio no es una cadena:', beneficio);
      return;
    }
    const beneficioData = this.beneficios.find(b => b.NOMBRE_BENEFICIO.toUpperCase() === beneficio.toUpperCase());

    if (!beneficioData) {
      console.error('No se encontró el beneficio en la lista:', beneficio);
      return;
    }

    const nombre_completo = [
      this.persona.PRIMER_NOMBRE,
      this.persona.SEGUNDO_NOMBRE,
      this.persona.TERCER_NOMBRE,
      this.persona.PRIMER_APELLIDO,
      this.persona.SEGUNDO_APELLIDO
    ]
      .filter(Boolean)
      .join(' ')
      .toUpperCase();

      console.log(beneficioData);
      

      const tipos = this.persona?.TIPOS_PERSONA || [];
const tiposPermitidos = ['BENEFICIARIO', 'DESIGNADO', 'BENEFICIARIO SIN CAUSANTE'];
const esSoloBeneficiario = tipos.length > 0 && tipos.every((t:any) => tiposPermitidos.includes(t));

    const data = {
      nombre_completo: nombre_completo,
      n_identificacion: beneficioData.N_IDENTIFICACION,
      beneficio: beneficio.toUpperCase(),
      departamento: beneficioData.NOMBRE_DEPARTAMENTO || 'NO DEFINIDO',
      monto: beneficioData.MONTO_POR_PERIODO || 0,
      monto_letras: this.convertirNumeroALetrasConCentavos(beneficioData.MONTO_POR_PERIODO || 0),
      fecha_inicio: this.convertirFechaAPalabras(beneficioData.FECHA_EFECTIVIDAD),
      fecha_fin: this.convertirFechaAPalabras(beneficioData.PERIODO_FINALIZACION),
      num_rentas_aprobadas: beneficioData.NUM_RENTAS_APROBADAS || 'INDEFINIDO',
      ocultarDepartamento: esSoloBeneficiario
    };

    const dto = this.usuarioToken;

    if (!dto || !dto.numero_empleado || !dto.departamento || !dto.municipio || !dto.nombrePuesto) {
      console.error('Faltan datos del usuario en el token:', dto);
      return;
    }

    this.afiliadoService.generarConstanciaQR(data, dto, 'constancia-beneficios').subscribe(
      (blob: Blob) => {
        const nombreArchivo = this.generarNombreArchivo(this.persona, 'constancia-beneficios');
        this.manejarDescarga(blob, nombreArchivo);
      },
      (error) => {
        console.error('Error al generar la nueva constancia de beneficio:', error);
      }
    );
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

  openSubOptionsDialog(options: string[], callback: (beneficio: any) => void): void {
    const dialogRef = this.dialog.open(DialogSuboptionsComponent, {
      width: '400px',
      data: { options },
    });
    dialogRef.afterClosed().subscribe((selectedOption) => {
      if (selectedOption) {
        callback(selectedOption);
      } else {
      }
    });
  }

  generateConstanciaBeneficio(beneficio: any): void {
    if (!this.beneficios || this.beneficios.length === 0) {
      console.error('No hay beneficios disponibles.');
      return;
    }
    if (typeof beneficio === 'object' && beneficio?.selectedOption) {
      beneficio = beneficio.selectedOption.NOMBRE_BENEFICIO || beneficio.selectedOption;
    }
    if (typeof beneficio !== 'string') {
      console.error('El valor de beneficio no es una cadena válida:', beneficio);
      return;
    }
    const beneficioData = this.beneficios.find(b => b.NOMBRE_BENEFICIO.toUpperCase() === beneficio.toUpperCase());
  
    if (!beneficioData) {
      console.error('No se encontró el beneficio en la lista:', beneficio);
      return;
    }
    if (!beneficioData.N_IDENTIFICACION) {
      console.error('El beneficio seleccionado no tiene datos completos:', beneficioData);
      return;
    }
  
    const beneficioClean = beneficioData.NOMBRE_BENEFICIO.trim().toUpperCase();
    const nombre_completo = [
      this.persona?.PRIMER_NOMBRE,
      this.persona?.SEGUNDO_NOMBRE,
      this.persona?.TERCER_NOMBRE,
      this.persona?.PRIMER_APELLIDO,
      this.persona?.SEGUNDO_APELLIDO
    ]
      .filter(Boolean)
      .join(' ')
      .toUpperCase();
  
    const data = {
      nombre_completo: nombre_completo,
      n_identificacion: beneficioData.N_IDENTIFICACION,
      beneficio: beneficioClean,
      departamento: beneficioData.NOMBRE_DEPARTAMENTO || 'NO DEFINIDO',
      monto: beneficioData.MONTO_POR_PERIODO || 0,
      monto_letras: this.convertirNumeroALetrasConCentavos(beneficioData.MONTO_POR_PERIODO || 0),
      fecha_inicio: this.convertirFechaAPalabras(beneficioData.FECHA_EFECTIVIDAD),
      fecha_fin: this.convertirFechaAPalabras(beneficioData.PERIODO_FINALIZACION),
    };
  
  
    const dto = this.usuarioToken;
  
    if (!dto || !dto.numero_empleado || !dto.departamento || !dto.municipio || !dto.nombrePuesto) {
      console.error('Faltan datos del usuario en el token:', dto);
      return;
    }
  
    this.afiliadoService.generarConstanciaQR(data, dto, 'beneficios').subscribe(
      (blob: Blob) => {
        const nombreArchivo = this.generarNombreArchivo(this.persona, 'beneficios');
        this.manejarDescarga(blob, nombreArchivo);
      },
      (error) => {
        console.error('Error al generar la nueva constancia de beneficio:', error);
      }
    );
  }
  
  private convertirNumeroALetrasConCentavos(monto: number): string {
    if (isNaN(monto) || monto === null || monto === undefined) {
      return 'CERO LEMPIRAS';
    }
  
    const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
    const decenas = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
  
    function convertirCentenas(num: number): string {
      if (num === 0) return '';
      if (num === 100) return 'CIEN';
    
      const c = Math.floor(num / 100);
      const d = Math.floor((num % 100) / 10);
      const u = num % 10;
    
      let texto = c > 0 ? `${centenas[c]} ` : '';
    
      if (d === 1) {
        texto += especiales[u];
      } else if (d === 2 && u > 0) {
        texto += `VEINTI${unidades[u].toLowerCase()}`;
      } else {
        texto += decenas[d];
        if (d > 2 && u > 0) {
          texto += ` Y ${unidades[u]}`;
        } else if (d < 2 && u > 0) {
          texto += ` ${unidades[u]}`;
        }
      }
    
      return texto.trim();
    }    
  
    function convertirMiles(num: number): string {
      if (num === 0) return '';
      if (num === 1) return 'MIL';
      return `${convertirCentenas(num)} MIL`;
    }
  
    function convertirMillones(num: number): string {
      if (num === 0) return '';
      if (num === 1) return 'UN MILLÓN';
      return `${convertirCentenas(num)} MILLONES`;
    }
  
    const millones = Math.floor(monto / 1000000);
    const miles = Math.floor((monto % 1000000) / 1000);
    const resto = Math.floor(monto % 1000);
    const centavos = Math.round((monto % 1) * 100);
  
    let letras = '';
    if (millones > 0) letras += `${convertirMillones(millones)} `;
    if (miles > 0) letras += `${convertirMiles(miles)} `;
    if (resto > 0) letras += convertirCentenas(resto);
  
    letras = letras.trim();
  
    return `${letras} LEMPIRAS${centavos > 0 ? ` CON ${centavos}/100 CENTAVOS` : ''}`;
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
  
    let partesFecha;
    
    if (fecha.includes('/')) {
      partesFecha = fecha.split('/');
      if (partesFecha.length !== 3) {
        console.error('Formato de fecha inválido:', fecha);
        return 'Fecha no válida';
      }
  
      const dia = parseInt(partesFecha[0], 10);
      const mes = meses[parseInt(partesFecha[1], 10) - 1];
      const anio = partesFecha[2];
  
      return `${dia} de ${mes} del ${anio}`;
    } 
  
    if (fecha.includes('-')) {
      partesFecha = fecha.split('-');
      if (partesFecha.length !== 3) {
        console.error('Formato de fecha inválido:', fecha);
        return 'Fecha no válida';
      }
  
      const anio = partesFecha[0];
      const mes = meses[parseInt(partesFecha[1], 10) - 1];
      const dia = parseInt(partesFecha[2], 10);
  
      return `${dia} de ${mes} del ${anio}`;
    }
  
    console.error('Formato de fecha no reconocido:', fecha);
    return 'Fecha no válida';
  }

  generateConstanciaJubiladoFallecido(beneficio: any): void {
    if (!this.beneficios || this.beneficios.length === 0) {
      console.error('No hay beneficios disponibles.');
      return;
    }
  
    // ✅ Si `beneficio` es un objeto, intentamos obtener la propiedad correcta
    if (typeof beneficio === 'object' && beneficio?.selectedOption) {
      beneficio = beneficio.selectedOption.NOMBRE_BENEFICIO || beneficio.selectedOption;
    }
  
    // ✅ Nos aseguramos de que `beneficio` sea un string
    if (typeof beneficio !== 'string') {
      console.error('El valor de beneficio no es una cadena válida:', beneficio);
      return;
    }
  
    // 🔹 Buscamos el beneficio correcto en la lista
    const beneficioData = this.beneficios.find(b => b.NOMBRE_BENEFICIO.toUpperCase() === beneficio.toUpperCase());
  
    if (!beneficioData) {
      console.error('No se encontró el beneficio en la lista:', beneficio);
      return;
    }
  
    const beneficioClean = beneficioData.NOMBRE_BENEFICIO.trim().toUpperCase();
    const nombre_completo = [
      this.persona.PRIMER_NOMBRE,
      this.persona.SEGUNDO_NOMBRE,
      this.persona.TERCER_NOMBRE,
      this.persona.PRIMER_APELLIDO,
      this.persona.SEGUNDO_APELLIDO
    ]
      .filter(Boolean)
      .join(' ')
      .toUpperCase();
  
    const data = {
      nombre_completo: nombre_completo,
      n_identificacion: beneficioData.N_IDENTIFICACION,
      beneficio: beneficioClean,
      departamento: beneficioData.NOMBRE_DEPARTAMENTO || 'NO DEFINIDO',
      monto: beneficioData.MONTO_POR_PERIODO || 0,
      monto_letras: this.convertirNumeroALetrasConCentavos(beneficioData.MONTO_POR_PERIODO || 0),
      fecha_inicio: this.convertirFechaAPalabras(beneficioData.FECHA_EFECTIVIDAD),
      fecha_fin: this.convertirFechaAPalabras(beneficioData.PERIODO_FINALIZACION),
      num_rentas_aprobadas: beneficioData.NUM_RENTAS_APROBADAS || 'INDEFINIDO'
    };
  
  
    const dto = this.usuarioToken;
  
    if (!dto || !dto.numero_empleado || !dto.departamento || !dto.municipio || !dto.nombrePuesto) {
      console.error('Faltan datos del usuario en el token:', dto);
      return;
    }
  
    this.afiliadoService.generarConstanciaQR(data, dto, 'constancia-beneficio-fallecido').subscribe(
      (blob: Blob) => {
        const nombreArchivo = this.generarNombreArchivo(this.persona, 'constancia-beneficio-fallecido');
        this.manejarDescarga(blob, nombreArchivo);
      },
      (error) => {
        console.error('Error al generar la constancia de jubilado fallecido:', error);
      }
    );
  }
  
  generateConstanciaBeneficiariosSinPago(): void {
    if (!this.persona) {
      this.toastr.error('Debe seleccionar una persona antes de generar la constancia.', 'Error');
      return;
    }
  
    // ✅ Verificar si la persona está fallecida
    if (this.persona.fallecido !== 'SI') {
      this.toastr.warning('Solo se pueden generar constancias para personas fallecidas.', 'Advertencia');
      return;
    }
  
    const nombre_completo = [
      this.persona.PRIMER_NOMBRE,
      this.persona.SEGUNDO_NOMBRE,
      this.persona.TERCER_NOMBRE,
      this.persona.PRIMER_APELLIDO,
      this.persona.SEGUNDO_APELLIDO
    ]
      .filter(Boolean)
      .join(' ')
      .toUpperCase();
  
    const dni = this.persona.N_IDENTIFICACION;
  
    this.beneficiosService.verificarPagosBeneficiarios(dni).subscribe(
      (recibioPagos: boolean) => {
        console.log(`Estado de pagos para los beneficiarios de ${dni}:`, recibioPagos);
  
        if (!!recibioPagos) {
          this.toastr.warning(
            'Los beneficiarios de esta persona han recibido pagos. No se puede generar la constancia.',
            'Advertencia'
          );
          return;
        }
  
        // ✅ Si no ha recibido pagos, seleccionar un beneficio antes de generar la constancia
        if (this.beneficios.length === 0) {
          this.toastr.warning('No hay beneficios disponibles para esta persona.', 'Advertencia');
          return;
        }
  
        const beneficiosNombres = this.beneficios.map(b => b.NOMBRE_BENEFICIO);
        this.openSubOptionsDialog(beneficiosNombres, (beneficioSeleccionado: any) => {
          if (!beneficioSeleccionado) {
            this.toastr.warning('Debe seleccionar un beneficio para continuar.', 'Advertencia');
            return;
          }
  
          // 🔹 Asegurar que `beneficioSeleccionado` sea una cadena antes de llamar `toUpperCase()`
          let beneficioNombre = '';
          if (typeof beneficioSeleccionado === 'string') {
            beneficioNombre = beneficioSeleccionado.toUpperCase();
          } else if (beneficioSeleccionado?.selectedOption) {
            beneficioNombre = beneficioSeleccionado.selectedOption.toUpperCase();
          }
  
          if (!beneficioNombre) {
            this.toastr.warning('Debe seleccionar un beneficio válido.', 'Advertencia');
            return;
          }
  
          const data = {
            nombre_completo,
            n_identificacion: dni,
            beneficio: beneficioNombre
          };
  
          const dto = this.usuarioToken;
  
          if (!dto || !dto.numero_empleado || !dto.departamento || !dto.municipio || !dto.nombrePuesto) {
            console.error('Faltan datos del usuario en el token:', dto);
            return;
          }
  
          this.afiliadoService.generarConstanciaQR(data, dto, 'beneficiarios-sin-pago').subscribe(
            (blob: Blob) => {
              const nombreArchivo = this.generarNombreArchivo(this.persona, 'beneficiarios-sin-pago');
              this.manejarDescarga(blob, nombreArchivo);
            },
            (error) => {
              console.error('Error al generar la constancia de beneficiarios sin pago:', error);
              this.toastr.error('Hubo un error al generar la constancia.', 'Error');
            }
          );
        });
      },
      (error) => {
        console.error('Error al verificar pagos de beneficiarios:', error);
        this.toastr.error('Hubo un error al verificar si los beneficiarios han recibido pagos.', 'Error');
      }
    );
  }
  
  
  
  
}
