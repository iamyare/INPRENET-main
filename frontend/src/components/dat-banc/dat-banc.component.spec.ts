import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatBancComponent } from './dat-banc.component';

describe('DatBancComponent', () => {
  let component: DatBancComponent;
  let fixture: ComponentFixture<DatBancComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatBancComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DatBancComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
