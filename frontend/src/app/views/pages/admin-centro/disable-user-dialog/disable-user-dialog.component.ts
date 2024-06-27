import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-disable-user-dialog',
  templateUrl: './disable-user-dialog.component.html',
  styleUrls: ['./disable-user-dialog.component.scss']
})
export class DisableUserDialogComponent {
  disableForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DisableUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.disableForm = this.fb.group({
      disablePeriod: [{ value: '', disabled: false }],
      indefinite: [false]
    });

    this.disableForm.get('indefinite')?.valueChanges.subscribe(indefinite => {
      if (indefinite) {
        this.disableForm.get('disablePeriod')?.disable();
      } else {
        this.disableForm.get('disablePeriod')?.enable();
      }
    });
  }

  onDisable() {
    if (this.disableForm.valid) {
      this.dialogRef.close(this.disableForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
