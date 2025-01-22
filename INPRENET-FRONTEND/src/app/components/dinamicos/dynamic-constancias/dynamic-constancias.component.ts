import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-dynamic-constancias',
  templateUrl: './dynamic-constancias.component.html',
  styleUrls: ['./dynamic-constancias.component.scss'],
})
export class DynamicConstanciasComponent implements OnInit {
  @Input() buttons: { label: string }[] = [];
  @Output() buttonClick = new EventEmitter<string>();

  selectedConstancia: string | null = null;

  constructor() {}

  ngOnInit(): void {}

  onButtonClick(button: { label: string }): void {
    this.selectedConstancia = button.label;
    this.buttonClick.emit(button.label);
  }
}
