import { DateTime } from 'luxon';

function validarFormatoFecha(cadenaFecha: string) {
  const formatoFechaRegex = /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{2}\s\d{4}\s\d{2}:\d{2}:\d{2}\sGMT[-+]\d{4}\s\([^)]+\)$/;

  return formatoFechaRegex.test(cadenaFecha);
}

function formatoFechaResol(fecha: string): string {
  let result = fecha;
  if (fecha && validarFormatoFecha(fecha)) {
    result = DateTime.fromJSDate(new Date(fecha)).toFormat('dd/MM/yyyy');
  }

  return result;
}

export default formatoFechaResol;
