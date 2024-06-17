import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JubiladoComponent } from './jubilado.component';

describe('JubiladoComponent', () => {
  let component: JubiladoComponent;
  let fixture: ComponentFixture<JubiladoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JubiladoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JubiladoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
