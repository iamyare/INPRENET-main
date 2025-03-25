import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionEventsService {
  private eventSource: EventSource | null = null;
  private sessionEvents = new Subject<any>();

  constructor(private ngZone: NgZone) {}

  connect(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.ngZone.runOutsideAngular(() => {
      this.eventSource = new EventSource(`${environment.API_URL}/api/sse/session-events`);

      this.eventSource.onmessage = (event) => {
        this.ngZone.run(() => {
          const data = JSON.parse(event.data);
          this.sessionEvents.next(data);
        });
      };

      this.eventSource.onerror = (error) => {
        this.ngZone.run(() => {
          console.error('SSE Error:', error);
          if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
          }
          // Intentar reconectar después de 5 segundos
          setTimeout(() => this.connect(), 5000);
        });
      };
    });
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  getSessionEvents(): Observable<any> {
    return this.sessionEvents.asObservable();
  }
}