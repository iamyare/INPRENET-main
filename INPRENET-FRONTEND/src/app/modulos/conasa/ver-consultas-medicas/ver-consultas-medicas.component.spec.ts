import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerConsultasMedicasComponent } from './ver-consultas-medicas.component';

describe('VerConsultasMedicasComponent', () => {
  let component: VerConsultasMedicasComponent;
  let fixture: ComponentFixture<VerConsultasMedicasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerConsultasMedicasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerConsultasMedicasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
