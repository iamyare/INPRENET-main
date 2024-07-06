/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PlanillaIngresosService } from './planillaIngresos.service';

describe('Service: PlanillaIngresos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlanillaIngresosService]
    });
  });

  it('should ...', inject([PlanillaIngresosService], (service: PlanillaIngresosService) => {
    expect(service).toBeTruthy();
  }));
});
