import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarFallecidosComponent } from './actualizar-fallecidos.component';

describe('ActualizarFallecidosComponent', () => {
  let component: ActualizarFallecidosComponent;
  let fixture: ComponentFixture<ActualizarFallecidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarFallecidosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActualizarFallecidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
