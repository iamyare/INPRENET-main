/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TransaccionesService } from './transacciones.service';

describe('Service: Transacciones', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TransaccionesService]
    });
  });

  it('should ...', inject([TransaccionesService], (service: TransaccionesService) => {
    expect(service).toBeTruthy();
  }));
});
