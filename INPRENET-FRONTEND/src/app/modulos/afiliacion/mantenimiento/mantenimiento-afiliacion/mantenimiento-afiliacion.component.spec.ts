import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoAfiliacionComponent } from './mantenimiento-afiliacion.component';

describe('MantenimientoAfiliacionComponent', () => {
  let component: MantenimientoAfiliacionComponent;
  let fixture: ComponentFixture<MantenimientoAfiliacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantenimientoAfiliacionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MantenimientoAfiliacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
