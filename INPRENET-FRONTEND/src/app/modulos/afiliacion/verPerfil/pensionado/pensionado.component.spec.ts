import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PensionadoComponent } from './pensionado.component';

describe('PensionadoComponent', () => {
  let component: PensionadoComponent;
  let fixture: ComponentFixture<PensionadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PensionadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PensionadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
