import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginBasePageComponent } from './login-base-page.component';

describe('LoginBasePageComponent', () => {
  let component: LoginBasePageComponent;
  let fixture: ComponentFixture<LoginBasePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginBasePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginBasePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
