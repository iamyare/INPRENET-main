import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerplanillacerradaPagComponent } from './verplanillacerrada-pag.component';

describe('VerplanillacerradaPagComponent', () => {
  let component: VerplanillacerradaPagComponent;
  let fixture: ComponentFixture<VerplanillacerradaPagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerplanillacerradaPagComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerplanillacerradaPagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
