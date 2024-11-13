import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignadoComponent } from './designado.component';

describe('DesignadoComponent', () => {
  let component: DesignadoComponent;
  let fixture: ComponentFixture<DesignadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DesignadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
