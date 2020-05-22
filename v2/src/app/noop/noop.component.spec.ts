import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoopComponent } from './noop.component';

describe('NoopComponent', () => {
  let component: NoopComponent;
  let fixture: ComponentFixture<NoopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
