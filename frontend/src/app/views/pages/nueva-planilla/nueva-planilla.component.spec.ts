import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaPlanillaComponent } from './nueva-planilla.component';

describe('NuevaPlanillaComponent', () => {
  let component: NuevaPlanillaComponent;
  let fixture: ComponentFixture<NuevaPlanillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevaPlanillaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NuevaPlanillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
