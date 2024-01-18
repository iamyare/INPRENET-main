import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosGenAfilComponent } from './datos-gen-afil.component';

describe('DatosGenAfilComponent', () => {
  let component: DatosGenAfilComponent;
  let fixture: ComponentFixture<DatosGenAfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatosGenAfilComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DatosGenAfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
