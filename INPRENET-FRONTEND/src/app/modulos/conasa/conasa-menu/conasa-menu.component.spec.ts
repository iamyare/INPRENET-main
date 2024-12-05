import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConasaMenuComponent } from './conasa-menu.component';

describe('ConasaMenuComponent', () => {
  let component: ConasaMenuComponent;
  let fixture: ComponentFixture<ConasaMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConasaMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConasaMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
