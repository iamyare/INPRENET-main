import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-suboptions',
  templateUrl: './dialog-suboptions.component.html',
  styleUrls: ['./dialog-suboptions.component.scss']
})
export class DialogSuboptionsComponent {
  dynamicParams: { key: string; label: string; type: string; value?: any }[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { 
      options?: string[], 
      params?: { key: string; label: string; type: string }[] 
    },
    private dialogRef: MatDialogRef<DialogSuboptionsComponent>
  ) {
    if (data.params) {
      this.dynamicParams = data.params.map(param => ({ ...param, value: '' }));
    }
  }

  onOptionClick(option: string): void {
    const paramsValues = this.dynamicParams.reduce((acc, param) => {
      acc[param.key] = param.value;
      return acc;
    }, {} as Record<string, any>);
  
    this.dialogRef.close({ selectedOption: option.trim(), params: paramsValues });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
