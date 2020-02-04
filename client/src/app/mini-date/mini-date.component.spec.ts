import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniDateComponent } from './mini-date.component';

describe('MiniDateComponent', () => {
  let component: MiniDateComponent;
  let fixture: ComponentFixture<MiniDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MiniDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MiniDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
