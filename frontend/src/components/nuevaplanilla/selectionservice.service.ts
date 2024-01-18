import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SelectionserviceService {
  constructor() { }
    selectedItems: any[] = [];

    addSelectedItem(item: any) {
        this.selectedItems.push(item);
    }

    removeSelectedItem(item: any) {
        this.selectedItems = this.selectedItems.filter(selectedItem => selectedItem !== item);
    }

    getSelectedItems() {
        return this.selectedItems;
    }
    
    
}
