import { TestBed } from '@angular/core/testing';

import { EscalafonService } from './escalafon.service';

describe('EscalafonService', () => {
  let service: EscalafonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EscalafonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
