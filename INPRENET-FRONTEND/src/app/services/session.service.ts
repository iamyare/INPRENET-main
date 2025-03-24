import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private socket: Socket;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.initializeWebSocketConnection();
  }

  private initializeWebSocketConnection() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.socket = io(environment.WS_URL, {
        query: { userId }
      });

      this.socket.on('connect', () => {
        console.log('Connected to session management service');
      });

      this.socket.on('session-expired', (data) => {
        this.toastr.warning(data.message, 'Session Closed');
        this.authService.logout();
        this.router.navigate(['/auth/login']);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from session management service');
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  reconnect() {
    this.disconnect();
    this.initializeWebSocketConnection();
  }
}