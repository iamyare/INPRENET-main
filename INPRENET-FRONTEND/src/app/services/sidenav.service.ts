import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {
  private sidenavOpenedSource = new BehaviorSubject<boolean>(true);
  sidenavOpened$ = this.sidenavOpenedSource.asObservable();

  toggleSidenav() {
    this.sidenavOpenedSource.next(!this.sidenavOpenedSource.value);
  }
}
