import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerCuentasPersonasComponent } from './ver-cuentas-personas.component';

describe('VerCuentasPersonasComponent', () => {
  let component: VerCuentasPersonasComponent;
  let fixture: ComponentFixture<VerCuentasPersonasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerCuentasPersonasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerCuentasPersonasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
