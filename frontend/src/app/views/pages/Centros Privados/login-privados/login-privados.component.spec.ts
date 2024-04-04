import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginPrivadosComponent } from './login-privados.component';

describe('LoginPrivadosComponent', () => {
  let component: LoginPrivadosComponent;
  let fixture: ComponentFixture<LoginPrivadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPrivadosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoginPrivadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
