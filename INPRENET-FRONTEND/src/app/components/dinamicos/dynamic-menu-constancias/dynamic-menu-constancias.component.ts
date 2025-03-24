import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-dynamic-menu-constancias',
  templateUrl: './dynamic-menu-constancias.component.html',
  styleUrls: ['./dynamic-menu-constancias.component.scss']
})
export class DynamicMenuConstanciasComponent implements OnInit {
  @Input() menuItems: { name: string, action: () => void }[] = [];

  constructor() {}

  ngOnInit(): void {}
}
