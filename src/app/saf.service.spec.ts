import { TestBed, inject } from '@angular/core/testing';

import { SafService } from './saf.service';

describe('SafService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SafService]
    });
  });

  it('should ...', inject([SafService], (service: SafService) => {
    expect(service).toBeTruthy();
  }));
});
