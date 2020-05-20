import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartListPageComponent } from './part-list-page.component';

describe('PartListPageComponent', () => {
  let component: PartListPageComponent;
  let fixture: ComponentFixture<PartListPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartListPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
