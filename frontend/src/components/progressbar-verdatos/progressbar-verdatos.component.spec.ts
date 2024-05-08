import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressbarVerdatosComponent } from './progressbar-verdatos.component';

describe('ProgressbarVerdatosComponent', () => {
  let component: ProgressbarVerdatosComponent;
  let fixture: ComponentFixture<ProgressbarVerdatosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressbarVerdatosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProgressbarVerdatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
