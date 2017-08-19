import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorPanelComponent } from './doctor-panel.component';

describe('DoctorPanelComponent', () => {
  let component: DoctorPanelComponent;
  let fixture: ComponentFixture<DoctorPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoctorPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
