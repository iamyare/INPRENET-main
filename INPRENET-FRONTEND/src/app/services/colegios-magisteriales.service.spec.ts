import { TestBed } from '@angular/core/testing';

import { ColegiosMagisterialesService } from './colegios-magisteriales.service';

describe('ColegiosMagisterialesService', () => {
  let service: ColegiosMagisterialesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColegiosMagisterialesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
