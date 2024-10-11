import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RobotPlotComponent } from './robot-plot.component';

describe('RobotPlotComponent', () => {
  let component: RobotPlotComponent;
  let fixture: ComponentFixture<RobotPlotComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RobotPlotComponent]
    });
    fixture = TestBed.createComponent(RobotPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
