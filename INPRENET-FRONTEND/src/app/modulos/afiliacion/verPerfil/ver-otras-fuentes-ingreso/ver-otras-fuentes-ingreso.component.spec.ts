import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerOtrasFuentesIngresoComponent } from './ver-otras-fuentes-ingreso.component';

describe('VerOtrasFuentesIngresoComponent', () => {
  let component: VerOtrasFuentesIngresoComponent;
  let fixture: ComponentFixture<VerOtrasFuentesIngresoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerOtrasFuentesIngresoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerOtrasFuentesIngresoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
