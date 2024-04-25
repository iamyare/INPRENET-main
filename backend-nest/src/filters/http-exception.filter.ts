// http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch(Error, HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = exception.response?.message || exception.message || 'Unexpected error occurred';
    
    if (message.includes('ORA-00001')) {
      const match = /ORA-00001: .* \((.*)\)/.exec(message);
      if (match && match[1]) {
        const constraintName = match[1];
        message = `Duplicate entry error. Violation of unique constraint: ${constraintName}. Please ensure the data is unique.`;
      }
    }

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message,
      });
  }
}
