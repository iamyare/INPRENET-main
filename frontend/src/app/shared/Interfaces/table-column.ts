import { ValidatorFn } from '@angular/forms';

export interface TableColumn {
  header: string;
  col: string;
  customRender?: (data: any) => string;
  isButton?: boolean;
  buttonAction?: (row: any) => void;
  buttonText?: string;
  isEditable?: boolean;
  moneda?: boolean;
  validationRules?: ValidatorFn[];
}
