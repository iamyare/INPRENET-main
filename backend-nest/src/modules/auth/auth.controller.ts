import { Controller, Post, Body, UseGuards, Request, Get, HttpCode, HttpStatus, UnauthorizedException, Logger, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Request as ExpressRequest } from 'express'; // Importa el tipo Request de Express
import { Public } from './public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

// DTO para el cuerpo de la solicitud de refresh
class RefreshTokenDto {
  refreshToken: string;
}

@Controller('auth') // Ruta base para este controlador: /auth
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint público para iniciar sesión.
   * @param req - Objeto Request de Express para obtener IP/UserAgent
   * @param loginDto - Credenciales de usuario.
   * @returns Access token y refresh token.
   */
  @Public() // Marca esta ruta como pública (si tienes un guard global)
  @Post('login')
  @HttpCode(HttpStatus.OK) // Devuelve 200 OK en lugar de 201 Created
  async login(@Req() req: ExpressRequest, @Body() loginDto: LoginDto) {
    this.logger.log(`Login attempt for user: ${loginDto.username}`);
    // Pasamos el objeto 'req' completo al servicio para que pueda extraer IP y User Agent
    return this.authService.login(loginDto, req);
  }

  /**
   * Endpoint público para refrescar el access token usando un refresh token.
   * @param body - DTO que contiene el refreshToken.
   * @returns Nuevos access_token y refresh_token.
   */
  @Public() // Esta ruta también debe ser pública
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: RefreshTokenDto) {
     this.logger.log('Refresh token request received');
     if (!body || !body.refreshToken) {
         throw new UnauthorizedException('Refresh token no proporcionado');
     }
     return this.authService.refreshToken(body.refreshToken);
  }


  /**
   * Endpoint protegido para cerrar sesión.
   * Requiere un Bearer Token válido en el header Authorization.
   * @param req - Objeto Request con la propiedad 'user' añadida por JwtAuthGuard y el token.
   * @returns Objeto indicando el éxito del logout.
   */
  @UseGuards(JwtAuthGuard) // Protege esta ruta, requiere token válido
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    this.logger.log(`Logout request received for user ID: ${req.user?.idUsuarioEmpresa}`);
    // Extraer el token del header para pasarlo al servicio
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        // Aunque el guard debería prevenir esto, es una doble verificación
        this.logger.warn('Logout attempt without token after guard.');
        throw new UnauthorizedException('Token no encontrado para logout');
    }
    const success = await this.authService.logout(token);
     if (success) {
         return { message: 'Logout exitoso' };
     } else {
         // Podrías devolver un error diferente si falla, pero OK suele ser suficiente
         this.logger.warn(`Logout process reported failure for user ID: ${req.user?.idUsuarioEmpresa}`);
         return { message: 'Logout procesado (puede que la sesión ya estuviera cerrada)' };
     }
  }

  /**
   * Endpoint de ejemplo protegido por JWT.
   * Solo accesible si se proporciona un Bearer Token válido.
   * @param req - Objeto Request con la propiedad 'user' añadida por JwtAuthGuard.
   * @returns El objeto 'user' adjuntado por el JwtStrategy.
   */
  @UseGuards(JwtAuthGuard) // Protege esta ruta
  @Get('profile')
  getProfile(@Request() req) {
    this.logger.log(`Profile access request for user ID: ${req.user?.idUsuarioEmpresa}`);
    // req.user contiene lo que devolvió el método validate de JwtStrategy
    return req.user;
  }
}
