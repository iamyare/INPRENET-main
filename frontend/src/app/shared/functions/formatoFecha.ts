import * as moment from 'moment';
export function convertirFecha(fechaStr: string): string {
  let fechaFormateada = "";
  if (fechaStr){
    const fecha = moment.utc(fechaStr);
    fechaFormateada = fecha.format('DD-MM-YYYY h:mm:ss A');
  }

  return fechaFormateada;
}
