import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatFamiliaresComponent } from './dat-familiares.component';

describe('DatFamiliaresComponent', () => {
  let component: DatFamiliaresComponent;
  let fixture: ComponentFixture<DatFamiliaresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatFamiliaresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DatFamiliaresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
