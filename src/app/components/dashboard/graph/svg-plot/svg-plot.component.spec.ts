import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgPlotComponent } from './svg-plot.component';

describe('SvgPlotComponent', () => {
  let component: SvgPlotComponent;
  let fixture: ComponentFixture<SvgPlotComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SvgPlotComponent]
    });
    fixture = TestBed.createComponent(SvgPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
