import { Component, OnInit, OnDestroy } from '@angular/core';
import { SidenavService } from '../../services/sidenav.service';
import { MENU_CONFIG, Section } from './menu-config';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {
  menuSections: Section[] = MENU_CONFIG;
  sidenavOpened: boolean = true;
  private sidenavSubscription!: Subscription;

  constructor(private sidenavService: SidenavService) {}

  ngOnInit() {
    this.sidenavSubscription = this.sidenavService.sidenavOpened$.subscribe(
      (isOpened) => {
        this.sidenavOpened = isOpened;
      }
    );
  }

  ngOnDestroy() {
    if (this.sidenavSubscription) {
      this.sidenavSubscription.unsubscribe();
    }
  }
}
