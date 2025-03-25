import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { SessionManagerService } from '../services/session-manager.service';
import { AuthService } from '../../services/auth.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private sessionManager: SessionManagerService,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // No interceptar peticiones a SSE
    if (request.url.includes('/sse/')) {
      return next.handle(request);
    }

    const token = this.sessionManager.getAccessToken();
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.sessionManager.getRefreshToken();
      if (!refreshToken) {
        this.handleLogout();
        return throwError(() => new Error('No refresh token available'));
      }

      return this.authService.refreshToken(refreshToken).pipe(
        switchMap(response => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.accessToken);
          
          // Guardar los nuevos tokens
          this.sessionManager.setTokens(response.accessToken, response.refreshToken);
          
          return next.handle(this.addToken(request, response.accessToken));
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.handleLogout();
          return throwError(() => err);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(this.addToken(request, token)))
    );
  }

  private handleLogout(): void {
    this.sessionManager.logout();
  }
}