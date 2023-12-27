import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialSalarioComponent } from './historial-salario.component';

describe('HistorialSalarioComponent', () => {
  let component: HistorialSalarioComponent;
  let fixture: ComponentFixture<HistorialSalarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialSalarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistorialSalarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
