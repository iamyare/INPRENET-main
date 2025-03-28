import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class RnpGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('✅ WebSocket Gateway Inicializado');
  }

  handleConnection(client: Socket) {
    console.log(`📡 Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`📡 Cliente desconectado: ${client.id}`);
  }

  sendFingerprint(imageBase64: string) {
    this.server.emit('fingerprint', `data:image/jpeg;base64,${imageBase64}`);
    console.log('📡 Huella enviada a todos los clientes conectados');
  }
}
