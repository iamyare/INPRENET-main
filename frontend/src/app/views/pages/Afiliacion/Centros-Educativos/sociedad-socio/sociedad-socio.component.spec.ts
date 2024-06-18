import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SociedadSocioComponent } from './sociedad-socio.component';

describe('SociedadSocioComponent', () => {
  let component: SociedadSocioComponent;
  let fixture: ComponentFixture<SociedadSocioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SociedadSocioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SociedadSocioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
