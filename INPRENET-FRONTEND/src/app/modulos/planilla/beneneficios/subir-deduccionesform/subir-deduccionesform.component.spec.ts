import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubirDeduccionesformComponent } from './subir-deduccionesform.component';

describe('SubirDeduccionesformComponent', () => {
  let component: SubirDeduccionesformComponent;
  let fixture: ComponentFixture<SubirDeduccionesformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubirDeduccionesformComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubirDeduccionesformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
