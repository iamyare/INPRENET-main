import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarColMagisComponent } from './agregar-col-magis.component';

describe('AgregarColMagisComponent', () => {
  let component: AgregarColMagisComponent;
  let fixture: ComponentFixture<AgregarColMagisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarColMagisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgregarColMagisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
