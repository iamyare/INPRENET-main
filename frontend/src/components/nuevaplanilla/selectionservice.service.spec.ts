import { TestBed } from '@angular/core/testing';

import { SelectionserviceService } from './selectionservice.service';

describe('SelectionserviceService', () => {
  let service: SelectionserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectionserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
