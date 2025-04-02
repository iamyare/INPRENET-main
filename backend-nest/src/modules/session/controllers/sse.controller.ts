import { Controller, Get, Req, Res, Logger, Param } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, Subject, interval } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { SseService } from '../services/sse.service';
import { JwtService } from '@nestjs/jwt';

@Controller('api/sse')
export class SseController {
  private readonly logger = new Logger(SseController.name);

  constructor(
    private readonly sseService: SseService,
    private readonly jwtService: JwtService
  ) {}

  @Get('session-events')
  async sessionEvents(@Req() req: Request, @Res() res: Response) {
    // Configurar cabeceras para SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Para NGINX

    // Extraer token de autorización
    let userId = 0; // Usuario anónimo por defecto
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = this.jwtService.verify(token);
        userId = payload.sub;
      } catch (error) {
        this.logger.warn(`Token inválido en conexión SSE: ${error.message}`);
      }
    }

    // Crear flujo de eventos para este cliente
    const client = new Subject<MessageEvent>();
    this.sseService.addClient(userId, client);
    
    // Observable para mantener la conexión viva con heartbeats
    const heartbeat$ = interval(30000).pipe(
      map(() => ({ data: { type: 'heartbeat', timestamp: new Date().toISOString() } } as MessageEvent))
    );

    // Creación de eventos SSE
    const close$ = new Subject<void>();
    
    // Combinar todos los flujos de eventos
    client.pipe(takeUntil(close$))
      .subscribe(
        (event: MessageEvent) => {
          const data = JSON.stringify(event.data);
          res.write(`data: ${data}\n\n`);
        },
        (error) => {
          this.logger.error(`Error en flujo SSE: ${error.message}`);
        },
        () => {
          this.logger.log('Flujo SSE completado');
        }
      );
    
    // Enviar heartbeats para mantener la conexión viva
    heartbeat$.pipe(takeUntil(close$))
      .subscribe(
        (event: MessageEvent) => {
          const data = JSON.stringify(event.data);
          res.write(`data: ${data}\n\n`);
        }
      );

    // Manejar cierre de conexión
    req.on('close', () => {
      this.logger.log(`Conexión SSE cerrada para usuario ${userId}`);
      this.sseService.removeClient(userId, client);
      close$.next();
      close$.complete();
    });
  }
}