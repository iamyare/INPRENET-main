import { Component, Input } from '@angular/core';

export interface MenuItem {
  title: string;
  icon: string;
  route?: string;
  action?: string;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}


@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent {
  @Input() sections: MenuSection[] = [];
}
