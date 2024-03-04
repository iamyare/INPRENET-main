import * as moment from 'moment';
export function convertirFecha(fechaStr: string, hora: boolean): string {
  let fechaFormateada = "";
  if (fechaStr && hora){
    const fecha = moment.utc(fechaStr);
    fechaFormateada = fecha.format('DD-MM-YYYY h:mm:ss A');
  }else if (fechaStr){
    const fecha = moment.utc(fechaStr);
    fechaFormateada = fecha.format('DD-MM-YYYY');
  }

  return fechaFormateada;
}
