import { Injectable, Logger } from '@nestjs/common';
import { Subject } from 'rxjs';

interface SessionEvent {
  type: string;
  message?: string;
  [key: string]: any;
}

@Injectable()
export class SseService {
  private readonly logger = new Logger(SseService.name);
  private clients: Map<number, Subject<MessageEvent>[]> = new Map();
  private globalEvents = new Subject<MessageEvent>();

  addClient(userId: number, client: Subject<MessageEvent>): void {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }
    this.clients.get(userId).push(client);
    this.logger.log(`Cliente conectado para usuario ${userId}. Total clientes: ${this.clients.get(userId).length}`);
  }

  removeClient(userId: number, client: Subject<MessageEvent>): void {
    const userClients = this.clients.get(userId) || [];
    const index = userClients.indexOf(client);
    
    if (index !== -1) {
      userClients.splice(index, 1);
      this.logger.log(`Cliente desconectado para usuario ${userId}. Clientes restantes: ${userClients.length}`);
      
      if (userClients.length === 0) {
        this.clients.delete(userId);
      }
    }
  }

  emitToUser(userId: number, data: SessionEvent): void {
    const userClients = this.clients.get(userId) || [];
    const event = { data } as MessageEvent;
    
    userClients.forEach(client => {
      try {
        client.next(event);
      } catch (error) {
        this.logger.error(`Error al emitir evento al usuario ${userId}: ${error.message}`);
      }
    });
  }

  emitToAll(data: SessionEvent): void {
    const event = { data } as MessageEvent;
    this.globalEvents.next(event);
    
    // También enviar a todos los clientes específicos
    this.clients.forEach((clients, userId) => {
      clients.forEach(client => {
        try {
          client.next(event);
        } catch (error) {
          this.logger.error(`Error al emitir evento global al usuario ${userId}: ${error.message}`);
        }
      });
    });
  }

  getGlobalEventStream() {
    return this.globalEvents.asObservable();
  }
}
