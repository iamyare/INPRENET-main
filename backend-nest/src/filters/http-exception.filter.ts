import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  HttpException, 
  HttpStatus, 
  NotFoundException 
} from '@nestjs/common';

@Catch(Error, HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Ocurrió un error inesperado. Inténtelo de nuevo más tarde o contacte con soporte si el problema persiste.';
    let errors: any[] = [];

    // Verifica si la excepción es una instancia de HttpException antes de llamar getResponse()
    let exceptionResponse: any = {};
    if (exception instanceof HttpException) {
      exceptionResponse = exception.getResponse ? exception.getResponse() : {};
      status = exception.getStatus();
    }

    if (exception instanceof NotFoundException) {
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse.message) {
        message = Array.isArray(exceptionResponse.message) 
          ? exceptionResponse.message.join(', ') 
          : exceptionResponse.message;
      } else {
        message = 'El recurso solicitado no fue encontrado. Verifique el ID y vuelva a intentarlo.';
      }
    } 
    else if (exception instanceof HttpException) {
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse.message) {
        message = Array.isArray(exceptionResponse.message) 
          ? exceptionResponse.message.join(', ') 
          : exceptionResponse.message;
        errors = exceptionResponse.errors || [];
      }
    } 
    else if (exception.message && typeof exception.message === 'string') {
      if (exception.message.includes('ORA-00001')) {
        const match = /ORA-00001: .* \((.*)\)/.exec(exception.message);
        if (match && match[1]) {
          const nombreRestriccion = match[1];
          message = `Error de entrada duplicada. Violación de la restricción única: ${nombreRestriccion}. Por favor, asegúrese de que los datos sean únicos.`;
        }
      } else {
        message = exception.message; // Usa el mensaje del error si está disponible
      }
    }

    console.error(`🚨 Error en ${request.method} ${request.url}: ${exception.message || 'Sin mensaje de error'}`);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      errors,
    });
  }
}
