import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfiliacionDocentesComponent } from './afiliacion-docentes.component';

describe('AfiliacionDocentesComponent', () => {
  let component: AfiliacionDocentesComponent;
  let fixture: ComponentFixture<AfiliacionDocentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfiliacionDocentesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AfiliacionDocentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
