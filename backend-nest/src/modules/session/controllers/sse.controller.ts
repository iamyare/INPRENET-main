import { Controller, Get, Sse, UseGuards } from '@nestjs/common';
import { Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { RolesGuard } from '../../../guards/auth/auth.guard';
import { SessionService } from '../services/session.service';
import { MessageEvent } from '@nestjs/common';

@Controller('api/sse')
export class SSEController {
  private readonly connectedClients: Map<number, any[]> = new Map();

  constructor(private readonly sessionService: SessionService) {}

  @UseGuards(RolesGuard)
  @Get('session-events')
  @Sse()
  sessionEvents(): Observable<MessageEvent> {
    return interval(30000).pipe(  // Verificar cada 30 segundos
      map(() => ({
        data: {
          type: 'session-check',
          timestamp: new Date().toISOString()
        },
        id: new Date().getTime().toString(),
        type: 'session-event',
        retry: 15000
      } as MessageEvent))
    );
  }

  // Método para emitir eventos a clientes específicos
  async emitSessionEvent(userId: number, eventType: string, data: any) {
    const clients = this.connectedClients.get(userId) || [];
    const event: MessageEvent = {
      data: {
        type: eventType,
        ...data
      },
      id: new Date().getTime().toString(),
      type: 'session-event',
      retry: 15000
    };

    clients.forEach(client => {
      client.emit('message', event);
    });
  }

  // Método para registrar un nuevo cliente
  registerClient(userId: number, client: any) {
    const clients = this.connectedClients.get(userId) || [];
    clients.push(client);
    this.connectedClients.set(userId, clients);
  }

  // Método para eliminar un cliente
  removeClient(userId: number, client: any) {
    const clients = this.connectedClients.get(userId) || [];
    const index = clients.indexOf(client);
    if (index > -1) {
      clients.splice(index, 1);
      if (clients.length === 0) {
        this.connectedClients.delete(userId);
      } else {
        this.connectedClients.set(userId, clients);
      }
    }
  }
}