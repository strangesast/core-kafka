import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCountPreviewComponent } from './activity-count-preview.component';

describe('ActivityCountPreviewComponent', () => {
  let component: ActivityCountPreviewComponent;
  let fixture: ComponentFixture<ActivityCountPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCountPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCountPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
