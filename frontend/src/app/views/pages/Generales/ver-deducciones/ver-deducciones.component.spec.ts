import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerDeduccionesComponent } from './ver-deducciones.component';

describe('VerDeduccionesComponent', () => {
  let component: VerDeduccionesComponent;
  let fixture: ComponentFixture<VerDeduccionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerDeduccionesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerDeduccionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
