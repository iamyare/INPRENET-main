export interface FieldArrays {
  name: string;
  label: string;
  icon?: string;
  layout?: { row: number; col: number };
  type: string;
  options?: { label: string; value: any }[];
  value?: any;
  validations?: any[];
}
