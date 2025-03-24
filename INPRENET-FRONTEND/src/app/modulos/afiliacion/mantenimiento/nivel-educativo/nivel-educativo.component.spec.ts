import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NivelEducativoComponent } from './nivel-educativo.component';

describe('NivelEducativoComponent', () => {
  let component: NivelEducativoComponent;
  let fixture: ComponentFixture<NivelEducativoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NivelEducativoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NivelEducativoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
