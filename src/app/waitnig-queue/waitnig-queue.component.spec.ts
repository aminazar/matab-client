import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitingQueueComponent } from './waitnig-queue.component';

describe('WaitingQueueComponent', () => {
  let component: WaitingQueueComponent;
  let fixture: ComponentFixture<WaitingQueueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaitingQueueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaitingQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
