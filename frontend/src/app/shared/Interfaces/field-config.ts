import { ValidatorFn } from '@angular/forms';

export interface FieldConfig {
  readOnly?: boolean;
  display: boolean;
  type: string;
  label: string;
  name: string;
  value?: any;
  header?: string;
  options?: { label: string; value: any }[];
  validations?: ValidatorFn[];
  row?: number;
  col?: number;
  icon?: string;
}
