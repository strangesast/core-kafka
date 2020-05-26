import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveOrdersPageComponent } from './active-orders-page.component';

describe('ActiveOrdersPageComponent', () => {
  let component: ActiveOrdersPageComponent;
  let fixture: ComponentFixture<ActiveOrdersPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActiveOrdersPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveOrdersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
