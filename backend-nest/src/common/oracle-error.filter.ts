import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(Error)
export class OracleErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    // Verificar si el error es específico de Oracle ORA-00972
    if (exception.message && exception.message.includes('ORA-00972')) {
      const detailedMessage = this.extractDetailedMessage(exception.message);
      response
        .status(status)
        .json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: ctx.getRequest().url,
          error: 'Oracle Identifier Error',
          detailedMessage,
        });
    } else {
      // Para otros tipos de errores no manejados específicamente, enviar una respuesta genérica
      response
        .status(status)
        .json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: ctx.getRequest().url,
          message: 'Internal Server Error',
        });
    }
  }

  private extractDetailedMessage(errorMessage: string): string {
    // Implementar lógica para analizar el mensaje de error y extraer detalles
    // Por ejemplo, identificar la parte del mensaje que contiene el identificador problemático
    return `Error específico de Oracle: ${errorMessage}. Revise los identificadores en sus tablas, índices o relaciones.`;
  }
}
