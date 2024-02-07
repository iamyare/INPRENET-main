import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaDeduccionAfilComponent } from './nueva-deduccion-afil.component';

describe('NuevaDeduccionAfilComponent', () => {
  let component: NuevaDeduccionAfilComponent;
  let fixture: ComponentFixture<NuevaDeduccionAfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevaDeduccionAfilComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NuevaDeduccionAfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
