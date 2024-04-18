export interface Movimiento {
  monto: number;
  fechaMovimiento: Date;
  cuentaContable: string;
  descripcionTipoCuenta: string;
  debitoCreditoB: 'D' | 'C';
  activaB: 'S' | 'N';
}
