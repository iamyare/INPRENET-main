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

function obtenerNombreMes(fecha: string): string {
  if (fecha) {
    const partesFecha: string[] = fecha?.split('/');

    if (partesFecha.length !== 3) {
      return 'Formato de fecha inválido';
    }

    const numMes: number = parseInt(partesFecha[1], 10);
    const anio: number = parseInt(partesFecha[2], 10);

    const meses: string[] = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

    if (numMes >= 1 && numMes <= 12) {
      const nombreMes: string = meses[numMes - 1];
      return `${nombreMes} ${anio}`;
    } else {
      return '';
    }
  }
  return '';
}

export { convertirFecha, convertirFechaInputs, obtenerNombreMes }