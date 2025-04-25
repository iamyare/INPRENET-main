import { SetMetadata } from '@nestjs/common';

// Clave única para identificar metadatos de rutas públicas
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorador @Public() para marcar rutas que no requieren autenticación JWT.
 * Uso: Colocar encima de un método de controlador o de la clase del controlador.
 * Ejemplo:
 * @Public()
 * @Get('public-route')
 * getPublicData() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
