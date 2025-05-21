import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PruebaVidaComponent } from './prueba-vida.component';

describe('PruebaVidaComponent', () => {
  let component: PruebaVidaComponent;
  let fixture: ComponentFixture<PruebaVidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PruebaVidaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PruebaVidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
