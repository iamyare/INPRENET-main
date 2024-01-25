import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTipoDeduccionComponent } from './editar-tipo-deduccion.component';

describe('EditarTipoDeduccionComponent', () => {
  let component: EditarTipoDeduccionComponent;
  let fixture: ComponentFixture<EditarTipoDeduccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarTipoDeduccionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditarTipoDeduccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
