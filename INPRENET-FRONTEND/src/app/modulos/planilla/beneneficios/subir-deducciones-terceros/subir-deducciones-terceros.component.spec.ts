import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubirDeduccionesTercerosComponent } from './subir-deducciones-terceros.component';

describe('SubirDeduccionesTercerosComponent', () => {
  let component: SubirDeduccionesTercerosComponent;
  let fixture: ComponentFixture<SubirDeduccionesTercerosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubirDeduccionesTercerosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubirDeduccionesTercerosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
