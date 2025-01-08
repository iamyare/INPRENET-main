import { differenceInYears, parseISO, isValid } from 'date-fns';

export function calcularEdad(fechaNacimiento?: string): number | string {
  if (!fechaNacimiento) {
    return 'N/A'; // Devuelve 'N/A' si no hay fecha proporcionada
  }

  const fecha = parseISO(fechaNacimiento); // Intenta convertir la fecha
  if (!isValid(fecha)) {
    return 'N/A'; // Devuelve 'N/A' si la fecha no es válida
  }

  const edad = differenceInYears(new Date(), fecha); // Calcula la diferencia en años
  return edad;
}
