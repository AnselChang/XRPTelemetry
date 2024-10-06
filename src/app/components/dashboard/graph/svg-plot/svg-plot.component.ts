import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { TelemetryData } from 'src/app/models/telemetry-data';
import { Chart } from 'chart.js';

export interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-svg-plot',
  templateUrl: './svg-plot.component.html',
  styleUrls: ['./svg-plot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SvgPlotComponent implements OnChanges {
  @Input() data: TelemetryData = new TelemetryData();
  @Input() visibleChannels: string[] = [];

  public readonly PLOT_WIDTH = 1000;
  public readonly PLOT_HEIGHT = 1000;

  private readonly X_AXIS_SUBDIVISIONS = 3;
  private readonly Y_AXIS_SUBDIVISIONS = 4;

  private graphMinX!: number;
  private graphMaxX!: number;
  private graphMinY!: number;
  private graphMaxY!: number;

  ngOnChanges(): void {

    this.graphMinY = this.data.getMinY();
    this.graphMaxY = this.data.getMaxY();

    // at least 1000ms, and at least 5% more than the latest timestamp
    this.graphMaxX = Math.max(1000, this.data.getLatestTimestamp());
    this.graphMinX = 0;
  }

  // return in format "MM:SS.sss"
  timestampToString(timestamp: number): string {
    const minutes = Math.floor(timestamp / 60000);
    const seconds = Math.floor((timestamp % 60000) / 1000);
    const milliseconds = Math.floor(timestamp % 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  }


  // iterate from 0 to getMaxTimestamp() in X_AXIS_SUBDIVISIONS steps
  iterateXAxis(): number[] {
    const step = this.graphMaxX / this.X_AXIS_SUBDIVISIONS;
    return Array.from({length: this.X_AXIS_SUBDIVISIONS + 1}, (_, i) => i * step);
  }

  // iterate from graphMinY to graphMaxY in Y_AXIS_SUBDIVISIONS steps
  iterateYAxis(): number[] {
    const step = (this.graphMaxY - this.graphMinY) / this.Y_AXIS_SUBDIVISIONS;
    return Array.from({length: this.Y_AXIS_SUBDIVISIONS + 1}, (_, i) => this.graphMinY + i * step).reverse();
  }

  formatYAxisValue(value: number): string { 
    return value.toFixed(3);
  }


}
