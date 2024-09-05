import { differenceInYears, parseISO } from 'date-fns';

export function calcularEdad(fechaNacimiento: string): number {
  const fecha = parseISO(fechaNacimiento); // Convierte el string a un objeto Date
  const edad = differenceInYears(new Date(), fecha); // Calcula la diferencia en años
  return edad;
}
