import { ValidatorFn } from "@angular/forms";

export interface FieldConfig {
  type: string;
  name: string;
  label?: string;
  value?: any;
  options?: { label: string, value: any }[];
  validations?: ValidatorFn[];
  display?: boolean;
  readOnly?: boolean;
  col?: number;
  row?: number;
  icon?: string;
  dependentFields?: { [key: string]: FieldConfig[] };
}
