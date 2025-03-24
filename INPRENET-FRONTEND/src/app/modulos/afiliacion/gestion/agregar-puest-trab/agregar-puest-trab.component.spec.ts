import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarPuestTrabComponent } from './agregar-puest-trab.component';

describe('AgregarPuestTrabComponent', () => {
  let component: AgregarPuestTrabComponent;
  let fixture: ComponentFixture<AgregarPuestTrabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarPuestTrabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgregarPuestTrabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
