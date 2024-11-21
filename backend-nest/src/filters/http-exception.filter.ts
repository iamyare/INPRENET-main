// http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

@Catch(Error, HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Determinar el código de estado basado en el tipo de excepción
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // message de error predeterminado que se muestra a los clientes
    let message = 'Ocurrió un error inesperado. Inténtelo de nuevo más tarde o contacte con soporte si el problema persiste.';

    // Personalizar messages para errores o excepciones específicas
    if (exception instanceof NotFoundException) {
      // Extraer el message del cuerpo de la excepción
      const responseBody = exception.getResponse() as Record<string, any>;
      if (typeof responseBody === 'string') {
        message = responseBody;
      } else if (typeof responseBody === 'object' && responseBody.message) {
        message = Array.isArray(responseBody.message) ? responseBody.message.join(', ') : responseBody.message;
      } else {
        // message predeterminado si el recurso no fue encontrado
        message = 'El recurso solicitado no fue encontrado. Por favor, verifique el ID y vuelva a intentarlo.';
      }
    } else if (exception instanceof HttpException) {
      const responseBody = exception.getResponse() as Record<string, any>;
      if (typeof responseBody === 'string') {
        message = responseBody;
      } else if (typeof responseBody === 'object' && responseBody.message) {
        message = Array.isArray(responseBody.message) ? responseBody.message.join(', ') : responseBody.message;
      }
    } else if (exception.message && typeof exception.message === 'string') {
      if (exception.message.includes('ORA-00001')) {
        const match = /ORA-00001: .* \((.*)\)/.exec(exception.message);
        if (match && match[1]) {
          const nombreRestriccion = match[1];
          message = `Error de entrada duplicada. Violación de la restricción única: ${nombreRestriccion}. Por favor, asegúrese de que los datos sean únicos.`;
        }
      }
    }

    // Registrar un message de error en la consola sin detalles técnicos completos
    console.error(`Error ocurrido en ${request.method} ${request.url}: ${exception.message || 'No se proporcionó message de error'}`);

    // Enviar una respuesta JSON estructurada al cliente
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
