import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarDiscapacidadDialogComponent } from './gestionar-discapacidad-dialog.component';

describe('GestionarDiscapacidadDialogComponent', () => {
  let component: GestionarDiscapacidadDialogComponent;
  let fixture: ComponentFixture<GestionarDiscapacidadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarDiscapacidadDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionarDiscapacidadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
