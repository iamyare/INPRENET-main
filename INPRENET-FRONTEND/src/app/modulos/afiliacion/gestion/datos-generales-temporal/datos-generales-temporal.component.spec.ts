import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosGeneralesTemporalComponent } from './datos-generales-temporal.component';

describe('DatosGeneralesTemporalComponent', () => {
  let component: DatosGeneralesTemporalComponent;
  let fixture: ComponentFixture<DatosGeneralesTemporalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatosGeneralesTemporalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DatosGeneralesTemporalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
