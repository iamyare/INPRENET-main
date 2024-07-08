import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MENU_CONFIG, Section } from '../components/layout/menu-config';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {
  private sidenavOpenedSource = new BehaviorSubject<boolean>(true);
  sidenavOpened$ = this.sidenavOpenedSource.asObservable();

  toggleSidenav() {
    this.sidenavOpenedSource.next(!this.sidenavOpenedSource.value);
  }

  getMenuConfig(): Section[] {
    return MENU_CONFIG;
  }
}
