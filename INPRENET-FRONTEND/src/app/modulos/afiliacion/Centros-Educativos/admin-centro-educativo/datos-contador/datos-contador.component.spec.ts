import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosContadorComponent } from './datos-contador.component';

describe('DatosContadorComponent', () => {
  let component: DatosContadorComponent;
  let fixture: ComponentFixture<DatosContadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatosContadorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DatosContadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
