export function unirNombres(
  primerNombre: string, segundoNombre?: string, tercerNombre?: string,
  primerApellido?: string, segundoApellido?: string
): string {
  let partesNombre: any = [primerNombre, segundoNombre, tercerNombre, primerApellido, segundoApellido].filter(Boolean);

  let nombreCompleto: string = partesNombre.join(' ');
  return nombreCompleto;
}
