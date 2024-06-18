import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCentroEducativoComponent } from './admin-centro-educativo.component';

describe('AdminCentroEducativoComponent', () => {
  let component: AdminCentroEducativoComponent;
  let fixture: ComponentFixture<AdminCentroEducativoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCentroEducativoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminCentroEducativoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
