/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AfiliacionService } from './afiliacion.service';

describe('Service: Afiliacion', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AfiliacionService]
    });
  });

  it('should ...', inject([AfiliacionService], (service: AfiliacionService) => {
    expect(service).toBeTruthy();
  }));
});
