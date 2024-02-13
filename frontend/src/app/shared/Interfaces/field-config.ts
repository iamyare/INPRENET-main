import { ValidatorFn } from '@angular/forms';

export interface FieldConfig {
  readOnly?: boolean;
  type: string;
  label: string;
  name: string;
  value?: any;
  options?: { label: string; value: any }[];
  validations?: ValidatorFn[];
}
