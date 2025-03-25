export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthResponse {
  nombreEmpleado: string;
  rolesModulos: RolModulo[];
}

export interface RolModulo {
  rol: string;
  modulo: string;
}

export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface RefreshTokenResponse extends AuthResponse {}