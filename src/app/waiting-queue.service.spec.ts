import { TestBed, inject } from '@angular/core/testing';

import { WaitingQueueService } from './waiting-queue.service';

describe('WaitingQueueService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WaitingQueueService]
    });
  });

  it('should ...', inject([WaitingQueueService], (service: WaitingQueueService) => {
    expect(service).toBeTruthy();
  }));
});
