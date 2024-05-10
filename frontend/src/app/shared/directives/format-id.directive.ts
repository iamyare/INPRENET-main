import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appAddDniHyphens]'
})
export class AddDniHyphensDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event: KeyboardEvent): void {
    // Obtener el valor actual del input
    let inputValue = this.el.nativeElement.value.replace(/\D/g, '');

    // Insertar guiones cada 4 caracteres
    let formattedValue = inputValue.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');

    // Establecer el valor formateado en el input
    this.el.nativeElement.value = formattedValue;
  }
}
