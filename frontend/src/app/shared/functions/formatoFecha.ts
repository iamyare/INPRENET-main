import * as moment from 'moment';
export function convertirFecha(fechaStr: string): string {
  // Parsear la fecha utilizando moment.js
  const fecha = moment.utc(fechaStr);
  // Formatear la fecha en el formato deseado
  const fechaFormateada = fecha.format('DD-MM-YYYY h:mm:ss A');
  return fechaFormateada;
}
