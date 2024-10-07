import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, OnChanges, ViewChild } from '@angular/core';
import { TelemetryData } from 'src/app/models/telemetry-data';
import { ChartColor } from 'src/app/util/chart-color';

export interface Point {
  x: number;
  y: number;
}

export interface ChannelPoints {
  channel: string;
  color: ChartColor;
  radius: number;
  lineThickness: number;
  points: Point[];
  polyline: string;
}

@Component({
  selector: 'app-svg-plot',
  templateUrl: './svg-plot.component.html',
  styleUrls: ['./svg-plot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SvgPlotComponent implements OnChanges, AfterViewInit {
  @Input() data: TelemetryData = new TelemetryData();
  @Input() visibleChannels: string[] = [];
  @Input() hoveredChannel: string | null = null;
  @ViewChild('plot') plotView!: ElementRef;

  public PLOT_WIDTH = 1000;
  public PLOT_HEIGHT = 600;

  private readonly X_AXIS_SUBDIVISIONS = 3;
  private readonly Y_AXIS_SUBDIVISIONS = 4;

  readonly CIRCLE_RADIUS = 2;
  readonly HOVERED_CIRCLE_RADIUS = 3;
  readonly LINE_THICKNESS = 1.5;
  readonly HOVERED_LINE_THICKNESS = 2;

  private graphMinX!: number;
  private graphMaxX!: number;
  private graphMinY!: number;
  private graphMaxY!: number;

  channels: ChannelPoints[] = [];


  ngAfterViewInit(): void {
    this.PLOT_WIDTH = this.plotView.nativeElement.clientWidth;
    this.PLOT_HEIGHT = this.plotView.nativeElement.clientHeight;
  }

  ngOnChanges(): void {

    console.log('SvgPlotComponent::ngOnChanges');

    // Get the min/max for the visible channels
    this.graphMinY = this.data.getMinY(this.visibleChannels);
    this.graphMaxY = this.data.getMaxY(this.visibleChannels);

    // if the min or max is still at the default, set it to 0 or 1
    if (this.graphMinY === Infinity) this.graphMinY = 0;
    if (this.graphMaxY === -Infinity) this.graphMaxY = 1;

    // if the min and max are the same, add some padding
    if (this.graphMinY === this.graphMaxY) {
      this.graphMinY -= 1;
      this.graphMaxY += 1;
    }

    // round the min and max to the nearest 10^x, with some padding
    const diff = this.graphMaxY - this.graphMinY;
    this.graphMaxY += diff * 0.05;
    this.graphMinY -= diff * 0.05;
    const roundToPlace = Math.floor(Math.log10(diff / this.Y_AXIS_SUBDIVISIONS));
    const round10 = Math.pow(10, roundToPlace);
    this.graphMinY = Math.floor(this.graphMinY / round10) * round10;
    this.graphMaxY = Math.ceil(this.graphMaxY / round10) * round10;

    // at least 1000ms, and at least 5% more than the latest timestamp
    this.graphMaxX = Math.max(1000, this.data.getLatestTimestamp());
    this.graphMinX = 0;

    this.calculateChannels();
  }

  // Calculate the points for each channel
  calculateChannels(): void {

    this.channels = this.visibleChannels.map((channel, index) => {

      // color is modulo of the index
      const color = this.data.getChannelColor(channel);

      // filter to only points with numeric values
      const points = this.data.getAllDataForChannel(channel).filter(
        point => typeof point.value === 'number'
      ).map(point => this.plot(point.timestamp, point.value as number));

      const polyline = points.map(point => `${point.x},${point.y}`).join(' ');

      const hovered = this.hoveredChannel === channel;
      const radius = hovered ? this.HOVERED_CIRCLE_RADIUS : this.CIRCLE_RADIUS;
      const lineThickness = hovered ? this.HOVERED_LINE_THICKNESS : this.LINE_THICKNESS;

      return {channel, color, radius, lineThickness, points, polyline};
    });

    // Filter out channels with no points
    this.channels = this.channels.filter(channel => channel.points.length > 0);
  }

  // return in format "MM:SS.sss"
  timestampToString(timestamp: number): string {
    const minutes = Math.floor(timestamp / 60000);
    const seconds = Math.floor((timestamp % 60000) / 1000);
    const milliseconds = Math.floor(timestamp % 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  }

  // Given a timestamp and a data value, return a point in svg coordinate frame
  plot(timestamp: number, value: number): Point {
    const x = (timestamp - this.graphMinX) / (this.graphMaxX - this.graphMinX) * this.PLOT_WIDTH;
    const y = (this.graphMaxY - value) / (this.graphMaxY - this.graphMinY) * this.PLOT_HEIGHT;
    return {x, y};
  }


  // iterate from 0 to getMaxTimestamp() in X_AXIS_SUBDIVISIONS steps
  iterateXAxis(): number[] {
    const step = this.graphMaxX / this.X_AXIS_SUBDIVISIONS;
    return Array.from({length: this.X_AXIS_SUBDIVISIONS + 1}, (_, i) => i * step);
  }

  // iterate from 0 t PLOT_WIDTH in X_AXIS_SUBDIVISIONS steps
  iterateXSubdivisions(): number[] {
    const step = (this.PLOT_WIDTH - 1) / this.X_AXIS_SUBDIVISIONS;
    return Array.from({length: this.X_AXIS_SUBDIVISIONS + 1}, (_, i) => i * step);
  }

  // iterate from graphMinY to graphMaxY in Y_AXIS_SUBDIVISIONS steps
  iterateYAxis(): number[] {
    const step = (this.graphMaxY - this.graphMinY) / this.Y_AXIS_SUBDIVISIONS;
    return Array.from({length: this.Y_AXIS_SUBDIVISIONS + 1}, (_, i) => this.graphMinY + i * step).reverse();
  }

  // iterate from 0 to PLOT_HEIGHT in Y_AXIS_SUBDIVISIONS steps
  iterateYSubdivisions(): number[] {
    const step = (this.PLOT_HEIGHT - 1) / this.Y_AXIS_SUBDIVISIONS;
    return Array.from({length: this.Y_AXIS_SUBDIVISIONS + 1}, (_, i) => i * step).reverse();
  }

  formatYAxisValue(value: number): string { 
    return value.toFixed(3);
  }

  get viewBox(): string {
    return `0 0 ${this.PLOT_WIDTH} ${this.PLOT_HEIGHT}`;
  }

  @HostListener('window:resize', ['$event.target']) 
  onResize(rect: DOMRect) { 
    if (rect.width && rect.height && (rect.width !== this.PLOT_WIDTH || rect.height !== this.PLOT_HEIGHT)) {
      this.PLOT_WIDTH = rect.width;
      this.PLOT_HEIGHT = rect.height;
    }
  }


}
