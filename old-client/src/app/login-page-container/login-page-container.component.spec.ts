import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginPageContainerComponent } from './login-page-container.component';

describe('LoginPageContainerComponent', () => {
  let component: LoginPageContainerComponent;
  let fixture: ComponentFixture<LoginPageContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginPageContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPageContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
