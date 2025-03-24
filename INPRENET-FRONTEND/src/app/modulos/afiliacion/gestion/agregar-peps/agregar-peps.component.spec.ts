import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarPepsComponent } from './agregar-peps.component';

describe('AgregarPepsComponent', () => {
  let component: AgregarPepsComponent;
  let fixture: ComponentFixture<AgregarPepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarPepsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgregarPepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
