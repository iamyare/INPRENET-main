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

export { convertirFecha, convertirFechaInputs }