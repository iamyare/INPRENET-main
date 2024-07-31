import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaDeduccionPersComponent } from './nueva-deduccion-pers.component';

describe('NuevaDeduccionPersComponent', () => {
  let component: NuevaDeduccionPersComponent;
  let fixture: ComponentFixture<NuevaDeduccionPersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevaDeduccionPersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NuevaDeduccionPersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
