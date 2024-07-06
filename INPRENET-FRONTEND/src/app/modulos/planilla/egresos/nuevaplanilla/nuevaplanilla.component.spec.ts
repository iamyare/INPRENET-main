import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaplanillaComponent } from './nuevaplanilla.component';

describe('NuevaplanillaComponent', () => {
  let component: NuevaplanillaComponent;
  let fixture: ComponentFixture<NuevaplanillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevaplanillaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NuevaplanillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
