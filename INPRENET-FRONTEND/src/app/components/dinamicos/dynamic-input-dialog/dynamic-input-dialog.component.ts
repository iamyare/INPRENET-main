import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-dynamic-input-dialog',
  templateUrl: './dynamic-input-dialog.component.html',
  styleUrls: ['./dynamic-input-dialog.component.scss']
})
export class DynamicInputDialogComponent implements OnInit {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DynamicInputDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    this.data.inputs.forEach((input: any) => {
      this.form.addControl(input.name, this.fb.control(input.value || ''));
    });
  }

  onConfirm(): void {
    this.dialogRef.close(this.form.value);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
