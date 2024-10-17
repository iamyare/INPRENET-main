export interface FieldArrays {
  name: string;
  label: string;
  type: string;
  icon?: string;
  layout?: { row: number; col: number };
  options?: { label: string; value: any }[];
  value?: any;
  validations?: any[];
  maxDate?: Date;
  minDate?: Date;
  startDateControlName?: string;
  endDateControlName?: string;
}
