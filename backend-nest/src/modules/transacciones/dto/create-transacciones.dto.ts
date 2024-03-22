export class CreateTransaccionesDto {
    dni: string;
    descripcion: string; // Usado para encontrar el ID_TIPO_CUENTA
    monto: number;
    descripcionCorta: string;
    cuentaContable: string;
    debitoCredito: string; // 'D' para débito o 'C' para crédito
}
