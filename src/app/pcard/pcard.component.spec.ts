import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PcardComponent } from './pcard.component';

describe('PcardComponent', () => {
  let component: PcardComponent;
  let fixture: ComponentFixture<PcardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PcardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PcardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
