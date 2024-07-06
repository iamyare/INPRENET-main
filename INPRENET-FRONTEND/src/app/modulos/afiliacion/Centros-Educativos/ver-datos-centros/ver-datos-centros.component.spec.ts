import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerDatosCentrosComponent } from './ver-datos-centros.component';

describe('VerDatosCentrosComponent', () => {
  let component: VerDatosCentrosComponent;
  let fixture: ComponentFixture<VerDatosCentrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerDatosCentrosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerDatosCentrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
