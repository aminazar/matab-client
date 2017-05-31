import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitnigQueueComponent } from './waitnig-queue.component';

describe('WaitnigQueueComponent', () => {
  let component: WaitnigQueueComponent;
  let fixture: ComponentFixture<WaitnigQueueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaitnigQueueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaitnigQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
