import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraViewerPageComponent } from './camera-viewer-page.component';

describe('CameraViewerPageComponent', () => {
  let component: CameraViewerPageComponent;
  let fixture: ComponentFixture<CameraViewerPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CameraViewerPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CameraViewerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
