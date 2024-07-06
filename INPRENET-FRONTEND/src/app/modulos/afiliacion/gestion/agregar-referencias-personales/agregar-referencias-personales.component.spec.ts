import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarReferenciasPersonalesComponent } from './agregar-referencias-personales.component';

describe('AgregarReferenciasPersonalesComponent', () => {
  let component: AgregarReferenciasPersonalesComponent;
  let fixture: ComponentFixture<AgregarReferenciasPersonalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarReferenciasPersonalesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgregarReferenciasPersonalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
