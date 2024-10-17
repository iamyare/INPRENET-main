import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfiliarDocenteComponent } from './afiliar-docente.component';

describe('AfiliarDocenteComponent', () => {
  let component: AfiliarDocenteComponent;
  let fixture: ComponentFixture<AfiliarDocenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfiliarDocenteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AfiliarDocenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
