import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientIndexComponent } from './patient-index.component';

describe('PatientIndexComponent', () => {
  let component: PatientIndexComponent;
  let fixture: ComponentFixture<PatientIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
