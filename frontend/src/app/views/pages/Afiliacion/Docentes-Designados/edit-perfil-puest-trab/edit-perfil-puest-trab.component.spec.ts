import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPerfilPuestTrabComponent } from './edit-perfil-puest-trab.component';

describe('EditPerfilPuestTrabComponent', () => {
  let component: EditPerfilPuestTrabComponent;
  let fixture: ComponentFixture<EditPerfilPuestTrabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPerfilPuestTrabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditPerfilPuestTrabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
