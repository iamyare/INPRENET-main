import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarCuentasComponent } from './agregar-cuentas.component';

describe('AgregarCuentasComponent', () => {
  let component: AgregarCuentasComponent;
  let fixture: ComponentFixture<AgregarCuentasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarCuentasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgregarCuentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
