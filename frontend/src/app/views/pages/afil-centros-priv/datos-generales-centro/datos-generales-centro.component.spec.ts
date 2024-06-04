import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosGeneralesCentroComponent } from './datos-generales-centro.component';

describe('DatosGeneralesCentroComponent', () => {
  let component: DatosGeneralesCentroComponent;
  let fixture: ComponentFixture<DatosGeneralesCentroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatosGeneralesCentroComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DatosGeneralesCentroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
