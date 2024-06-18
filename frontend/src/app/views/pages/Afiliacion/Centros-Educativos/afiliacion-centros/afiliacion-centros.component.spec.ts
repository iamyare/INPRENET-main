import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfiliacionCentrosComponent } from './afiliacion-centros.component';

describe('AfiliacionCentrosComponent', () => {
  let component: AfiliacionCentrosComponent;
  let fixture: ComponentFixture<AfiliacionCentrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfiliacionCentrosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AfiliacionCentrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
