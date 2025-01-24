import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';

@Component({
  selector: 'app-dynamic-constancias',
  templateUrl: './dynamic-constancias.component.html',
  styleUrls: ['./dynamic-constancias.component.scss'],
})
export class DynamicConstanciasComponent implements OnInit, OnChanges {
  @Input() buttons: { label: string; allowedTypes?: string[] }[] = []; 
  @Input() tipoPersona: any; 
  @Output() buttonClick = new EventEmitter<string>();

  selectedConstancia: string | null = null;

  filteredButtons: { label: string; allowedTypes?: string[] }[] = [];

  constructor() {}

  ngOnInit(): void {
    this.filterButtons();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['buttons'] || changes['tipoPersona']) {
      this.filterButtons();
    }
  }

  filterButtons(): void {
    if (this.tipoPersona) {
      this.filteredButtons = this.buttons.filter(
        (button) =>
          !button.allowedTypes || button.allowedTypes.includes(this.tipoPersona)
      );
    } else {
      this.filteredButtons = this.buttons;
    }
  }

  onButtonClick(button: { label: string }): void {
    this.selectedConstancia = button.label;
    this.buttonClick.emit(button.label);
  }
}
