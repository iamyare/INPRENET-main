export function blockManualInput(event: KeyboardEvent): void {
  event.preventDefault();
}

export function clearManualInput(event: Event): void {
  const inputElement = event.target as HTMLInputElement;
  inputElement.value = '';
}
