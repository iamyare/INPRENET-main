import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarFamiliarComponent } from './agregar-familiar.component';

describe('AgregarFamiliarComponent', () => {
  let component: AgregarFamiliarComponent;
  let fixture: ComponentFixture<AgregarFamiliarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarFamiliarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgregarFamiliarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
