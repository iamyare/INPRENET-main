import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionEventsService implements OnDestroy {
  private eventSource: EventSource | null = null;
  private sessionEvents = new Subject<any>();
  private connectionError = new Subject<any>();
  private isConnected = false;

  constructor() {}

  connect(): void {
    if (this.isConnected) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      // Asegurarse de usar la URL base correcta
      const apiUrl = `${environment.API_URL}/api/sse/session-events`;
      
      this.eventSource = new EventSource(apiUrl, { withCredentials: true });
      
      this.eventSource.onopen = () => {
        console.log('SSE connection established');
        this.isConnected = true;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.sessionEvents.next(data);
        } catch (error) {
          console.error('Error parsing SSE event data:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        this.connectionError.next(error);
        this.disconnect();
        
        // Intentar reconectar después de un tiempo
        setTimeout(() => this.connect(), 5000);
      };
    } catch (error) {
      console.error('Error creating SSE connection:', error);
    }
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnected = false;
  }

  getSessionEvents(): Observable<any> {
    return this.sessionEvents.asObservable();
  }

  getConnectionErrors(): Observable<any> {
    return this.connectionError.asObservable();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}