import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosPropietarioComponent } from './datos-propietario.component';

describe('DatosPropietarioComponent', () => {
  let component: DatosPropietarioComponent;
  let fixture: ComponentFixture<DatosPropietarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatosPropietarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DatosPropietarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
