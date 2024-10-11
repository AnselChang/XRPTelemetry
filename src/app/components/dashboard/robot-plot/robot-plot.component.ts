import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChannelDataPoint, TelemetryData } from 'src/app/models/telemetry-data';
import { timestampToString } from 'src/app/util/timestamp';

interface Pose {
  timestamp: number; // in ms
  leftDistance: number; // in cm
  rightDistance: number; // in cm
  imuHeading: number; // in degrees
}

interface Position {
  timestamp: number;
  x: number;
  y: number;
  heading: number;
}

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

@Component({
  selector: 'app-robot-plot',
  templateUrl: './robot-plot.component.html',
  styleUrls: ['./robot-plot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RobotPlotComponent implements OnChanges {
  @Input() data: TelemetryData = new TelemetryData();
  @Input() currentTimestamp: number = 0;

  readonly PLOT_SIZE = 500; // in pixels
  readonly POINT_RAIDUS = 5; // in pixels
  readonly CLOSEST_POSITION_LINE_LENGTH = 25; // in pixels

  public minX = 0;
  public maxX = 0;
  public minY = 1;
  public maxY = 1;

  positions: Position[] = [];

  // The timestamp of the closest position to the current timestamp
  closestPositionTimestamp: number = 0;
  closestPositionLine: Line = {x1: 0, y1: 0, x2: 0, y2: 0};

  get viewBox(): string {
    return `0 0 ${this.PLOT_SIZE} ${this.PLOT_SIZE}`;
  }

  ngOnChanges(changes: SimpleChanges): void {

    // If the data changes, recalculate the positions
    if (changes['data']) {
      this.onDataChange();
    }

    if (changes['currentTimestamp']) {
      // Find the closest position to the current timestamp
      this.currentTimestamp = changes['currentTimestamp'].currentValue;
      this.closestPositionTimestamp = this.positions.reduce((prev, curr) => {
        return Math.abs(curr.timestamp - this.currentTimestamp) < Math.abs(prev - this.currentTimestamp) ? curr.timestamp : prev;
      }, this.positions[0].timestamp);

      // The line starting at closest position to the current timestamp, with direction of heading
      const closestPosition = this.positions.find((position) => position.timestamp === this.closestPositionTimestamp)!;
      const x = this.plotX(closestPosition.x);
      const y = this.plotY(closestPosition.y);
      const heading = closestPosition.heading * Math.PI / 180;
      const dx = this.CLOSEST_POSITION_LINE_LENGTH * Math.cos(heading);
      const dy = this.CLOSEST_POSITION_LINE_LENGTH * Math.sin(heading);
      this.closestPositionLine = {x1: x, y1: y, x2: x + dx, y2: y - dy};
    }

  }

  private onDataChange(): void {

    // First, fetch all data for left_distance, right_distance, and imu_heading
    let leftDistanceData: ChannelDataPoint[];
    let rightDistanceData: ChannelDataPoint[]
    let imuHeadingData: ChannelDataPoint[];
    try {
      leftDistanceData = this.data.getAllDataForChannel('left_distance');
      rightDistanceData = this.data.getAllDataForChannel('right_distance');
      imuHeadingData = this.data.getAllDataForChannel('imu_heading');
    } catch (e) {
      console.log("No data for left_distance, right_distance, or imu_heading, skipping RobotPlotComponent");
      return;
    }

    // remove any data where value is string
    leftDistanceData = leftDistanceData.filter((value) => typeof value.value === 'number');
    rightDistanceData = rightDistanceData.filter((value) => typeof value.value === 'number');
    imuHeadingData = imuHeadingData.filter((value) => typeof value.value === 'number');

    // Find the intersection of the timestamps
    const leftSet = new Set(leftDistanceData.map((value) => value.timestamp));
    const rightSet = new Set(rightDistanceData.map((value) => value.timestamp));
    const imuSet = new Set(imuHeadingData.map((value) => value.timestamp));

    const intersection = new Set([...leftSet].filter((x) => rightSet.has(x) && imuSet.has(x)));

    // Sort the timestamps ascending
    const timestamps = Array.from(intersection).sort((a, b) => a - b);
    if (timestamps.length < 2) {
      console.log("Need at least 2 timestamps with all left_distance/right_distance/imu_heading, skipping RobotPlotComponent");
      return;
    }

    const poses: Pose[] = timestamps.map((timestamp) => {
      const leftDistance = leftDistanceData.find((value) => value.timestamp === timestamp)!.value as number;
      const rightDistance = rightDistanceData.find((value) => value.timestamp === timestamp)!.value as number;
      const imuHeading = imuHeadingData.find((value) => value.timestamp === timestamp)!.value as number;
      return {timestamp, leftDistance, rightDistance, imuHeading};
    });

    // Calculate the positions of the robot at each timestamp
    this.positions = this.calculatePositions(poses);
    console.log(this.positions);

    // Update the bounds of the plot
    this.updateBoundsFromPositions();
  }

  // Given a x position in cm between minX and maxX, map to between 0 and PLOT_SIZE
  public plotX(x: number) {
    return (x - this.minX) / (this.maxX - this.minX) * this.PLOT_SIZE;
  }

  // Given a y position in cm between minY and maxY, map to between 0 and PLOT_SIZE
  public plotY(y: number) {
    return this.PLOT_SIZE - (y - this.minY) / (this.maxY - this.minY) * this.PLOT_SIZE;
  }

  public positionTooltip(position: Position): string {

    // round to 2 decimal places
    const x = position.x.toFixed(2);
    const y = position.y.toFixed(2);
    const heading = position.heading.toFixed(2);

    return `(${x}, ${y}, ${heading}°) @t=${timestampToString(position.timestamp)}`;
  }

  public positionColor(position: Position): string {

    // If this is the closest position to the current timestamp, return red
    if (position.timestamp === this.closestPositionTimestamp) {
      return '#FF4B4C';
    }

    // If position's timestamp hasn't occured yet, return transparent
    if (position.timestamp > this.currentTimestamp) {
      return 'rgba(255, 255, 255, 0)';
    }

    // opacity is position timestamp normalized from 0 to 1
    const opacity = position.timestamp / this.currentTimestamp;

    // return white with opacity
    return `rgba(255, 255, 255, ${opacity})`;
  }

  private calculatePositions(poses: Pose[]): Position[] {
    const positions: Position[] = [];
    let x = 0;
    let y = 0;

    // initialize values to first pose
    let prevLeftDistance = poses[0].leftDistance;
    let prevRightDistance = poses[0].rightDistance;
    let prevHeading = poses[0].imuHeading;
    positions.push({
      timestamp: poses[0].timestamp,
      x: 0,
      y: 0,
      heading: poses[0].imuHeading
    });
  
    // start at second pose
    for (const pose of poses.slice(1)) {
      const leftDistanceDelta = pose.leftDistance - prevLeftDistance;
      const rightDistanceDelta = pose.rightDistance - prevRightDistance;
      const averageDistance = (leftDistanceDelta + rightDistanceDelta) / 2;
      
      // Convert headings to radians
      const prevHeadingRad = prevHeading * Math.PI / 180;
      const currentHeadingRad = pose.imuHeading * Math.PI / 180;
      
      // Calculate change in heading
      let deltaTheta = currentHeadingRad - prevHeadingRad;
      
      // Normalize deltaTheta to be between -π and π
      deltaTheta = ((deltaTheta + Math.PI) % (2 * Math.PI)) - Math.PI;
  
      if (Math.abs(deltaTheta) < 1e-6) {
        // If the change in heading is very small, treat it as straight line motion
        x += averageDistance * Math.cos(currentHeadingRad);
        y += averageDistance * Math.sin(currentHeadingRad);
      } else {
        // Calculate radius of curvature
        const radius = averageDistance / deltaTheta;
        
        // Calculate change in x and y
        const dx = radius * (Math.sin(currentHeadingRad) - Math.sin(prevHeadingRad));
        const dy = radius * (Math.cos(prevHeadingRad) - Math.cos(currentHeadingRad));
        
        x += dx;
        y += dy;
      }
  
      positions.push({
        timestamp: pose.timestamp,
        x: x,
        y: y,
        heading: pose.imuHeading
      });
  
      prevLeftDistance = pose.leftDistance;
      prevRightDistance = pose.rightDistance;
      prevHeading = pose.imuHeading;
    }
  
    return positions;
  }

  private updateBoundsFromPositions(): void {

    // Calculate the bounds of the plot
    this.minX = Math.min(...this.positions.map((position) => position.x));
    this.maxX = Math.max(...this.positions.map((position) => position.x));
    this.minY = Math.min(...this.positions.map((position) => position.y));
    this.maxY = Math.max(...this.positions.map((position) => position.y));

    // at least 30cm diff each axis
    let diff = 30;
    diff = Math.max(diff, (this.maxX - this.minX) * 1.1);
    diff = Math.max(diff, (this.maxY - this.minY) * 1.1);

    const centerX = (this.minX + this.maxX) / 2;
    const centerY = (this.minY + this.maxY) / 2;

    this.minX = centerX - diff / 2;
    this.maxX = centerX + diff / 2;
    this.minY = centerY - diff / 2;
    this.maxY = centerY + diff / 2;
  }

}
