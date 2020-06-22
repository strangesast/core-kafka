import { TestBed } from '@angular/core/testing';

import { PersonPageGuard } from './person-page.guard';

describe('PersonPageGuard', () => {
  let guard: PersonPageGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PersonPageGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
