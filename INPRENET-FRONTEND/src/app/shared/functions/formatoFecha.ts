import * as moment from 'moment';

function convertirFecha(fechaStr: string, hora: boolean): string {
  let fechaFormateada = "";
  if (fechaStr && hora) {
    const fecha = moment.utc(fechaStr);
    fechaFormateada = fecha.format('DD-MM-YYYY h:mm:ss A');
  } else if (fechaStr) {
    const fecha = moment.utc(fechaStr);
    fechaFormateada = fecha.format('DD-MM-YYYY');
  }

  return fechaFormateada;
}

function convertirFechaInputs(fecha: string): string {
  if (fecha) {
    const fechaMoment = moment.utc(fecha);
    return fechaMoment.format('YYYY-MM-DD');
  }
  return ""
}

function convertirFechaInputsDMY(fecha: string): string {
  if (fecha) {
    const fechaMoment = moment.utc(fecha);
    return fechaMoment.format('DD/MM/YYYY');
  }
  return ""
}

function obtenerNombreMes(fecha: string): string {
  if (fecha) {
    const fechaObjeto = new Date(fecha);

    if (isNaN(fechaObjeto.getTime())) {
      return 'Formato de fecha inválido';
    }

    const numMes: number = fechaObjeto.getUTCMonth(); // Obtener el mes (0-11)
    const anio: number = fechaObjeto.getUTCFullYear(); // Obtener el año

    const meses: string[] = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

    const nombreMes: string = meses[numMes];
    return `${nombreMes} ${anio}`;
  }

  return '';
}

export { convertirFechaInputsDMY, convertirFecha, convertirFechaInputs, obtenerNombreMes }
