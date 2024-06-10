import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ControlContainer, FormControl } from '@angular/forms';

@Component({
  selector: 'app-buscador',
  templateUrl: './buscador.component.html',
  styleUrl: './buscador.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () =>
        inject(ControlContainer, { skipSelf: true, host: true }),
    },
  ]
})
export class BuscadorComponent {
  searchControl = new FormControl('');
  results: any[] = [];

  @Input() searchFunction!: (query: string) => any[];
  @Output() searchResult = new EventEmitter<any>();

  onSearch(): void {
    const query = this.searchControl.value!;
    this.results = this.searchFunction(query);
    this.searchResult.emit(this.results);
  }
}