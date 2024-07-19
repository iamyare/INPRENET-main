import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTipoPlanillaComponent } from './editar-tipo-planilla.component';

describe('EditarTipoPlanillaComponent', () => {
  let component: EditarTipoPlanillaComponent;
  let fixture: ComponentFixture<EditarTipoPlanillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarTipoPlanillaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditarTipoPlanillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
