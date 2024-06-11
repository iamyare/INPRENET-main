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

  @Input() searchFunction!: (query: string) => Promise<any[]>;
  @Output() searchResult = new EventEmitter<any>();

  onSearch(): void {
    const query = this.searchControl.value!;

    if (this.searchFunction) {
      this.searchFunction(query)
        .then((filteredData) => {
          this.results = filteredData;
          this.searchResult.emit(this.results)
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    } else {
      console.error('searchFunction is not defined.');
    }
  }
}