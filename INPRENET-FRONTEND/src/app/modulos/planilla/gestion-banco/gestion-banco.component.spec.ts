import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionBancoComponent } from './gestion-banco.component';

describe('GestionBancoComponent', () => {
  let component: GestionBancoComponent;
  let fixture: ComponentFixture<GestionBancoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionBancoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionBancoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
