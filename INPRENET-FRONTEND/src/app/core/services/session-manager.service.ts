import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { SessionEventsService } from './session-events.service';
import { MatDialog } from '@angular/material/dialog';
import { SessionDialogComponent } from '../../shared/components/session-dialog/session-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class SessionManagerService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly SESSION_TIMEOUT = 1800000; // 30 minutos en milisegundos
  private lastActivity: number = Date.now();
  private checkInterval: any;
  private isActive = new BehaviorSubject<boolean>(true);

  constructor(
    private router: Router,
    private sessionEvents: SessionEventsService,
    private dialog: MatDialog
  ) {
    this.initializeSessionMonitoring();
  }

  private showSessionDialog(title: string, message: string, showStayButton = false): void {
    const dialogRef = this.dialog.open(SessionDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title,
        message,
        showLogoutButton: true,
        showStayButton
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'logout' || !showStayButton) {
        this.logout();
      } else if (result === 'stay') {
        this.updateLastActivity();
      }
    });
  }

  private initializeSessionMonitoring(): void {
    // Monitorear eventos del usuario
    window.addEventListener('mousemove', () => this.updateLastActivity());
    window.addEventListener('keydown', () => this.updateLastActivity());
    window.addEventListener('click', () => this.updateLastActivity());
    window.addEventListener('scroll', () => this.updateLastActivity());

    // Iniciar monitoreo de inactividad
    this.checkInterval = setInterval(() => this.checkActivity(), 60000); // Verificar cada minuto

    // Suscribirse a eventos SSE
    this.sessionEvents.connect();
    this.sessionEvents.getSessionEvents().subscribe(event => {
      if (event.type === 'session-invalidated') {
        this.handleSessionInvalidation();
      }
    });
  }

  private updateLastActivity(): void {
    this.lastActivity = Date.now();
    this.isActive.next(true);
  }

  private checkActivity(): void {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;

    if (timeSinceLastActivity >= this.SESSION_TIMEOUT) {
      this.isActive.next(false);
      this.handleSessionTimeout();
    }
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    this.updateLastActivity();
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  logout(): void {
    this.clearTokens();
    this.sessionEvents.disconnect();
    this.router.navigate(['/login']);
  }

  getSessionStatus(): Observable<boolean> {
    return this.isActive.asObservable();
  }

  private handleSessionTimeout(): void {
    this.showSessionDialog(
      'Sesión por expirar',
      'Su sesión está por expirar debido a inactividad. ¿Desea mantener la sesión activa?',
      true
    );
  }

  private handleSessionInvalidation(): void {
    this.showSessionDialog(
      'Sesión finalizada',
      'Su sesión ha sido cerrada porque se ha iniciado sesión en otro dispositivo.',
      false
    );
  }

  ngOnDestroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.sessionEvents.disconnect();
  }
}