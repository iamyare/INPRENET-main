import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerEditarDeduccionAfilComponent } from './ver-editar-deduccion-afil.component';

describe('VerEditarDeduccionAfilComponent', () => {
  let component: VerEditarDeduccionAfilComponent;
  let fixture: ComponentFixture<VerEditarDeduccionAfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerEditarDeduccionAfilComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerEditarDeduccionAfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
