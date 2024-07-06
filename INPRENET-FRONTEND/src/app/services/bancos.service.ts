import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BancosService {

  constructor(private http: HttpClient,) { }
  getAllBancos(): Observable<any | void> {
    const url = `${environment.API_URL}/api/banco`;
    
    return this.http.get<any>(
      url,
    ).pipe(
      map((res:any) => {
          return res;
        })
      );
  }
}
