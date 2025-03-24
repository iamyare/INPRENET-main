import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearCuentaEscalafonComponent } from './crear-cuenta-escalafon.component';

describe('CrearCuentaEscalafonComponent', () => {
  let component: CrearCuentaEscalafonComponent;
  let fixture: ComponentFixture<CrearCuentaEscalafonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearCuentaEscalafonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrearCuentaEscalafonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
