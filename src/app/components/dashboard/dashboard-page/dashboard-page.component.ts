import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Host, HostListener, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TelemetryData } from 'src/app/models/telemetry-data';
import { TelemetryDataService } from 'src/app/services/telemetry-data.service';
import { timestampToString } from 'src/app/util/timestamp';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent implements OnDestroy {

  readonly DEFAULT_DATA = new TelemetryData();

  currentTimestamp$ = new BehaviorSubject<number>(0);
  latestTimestamp$ = new BehaviorSubject<number>(0);

  readonly timestampToString = timestampToString;

  isPlaying: boolean = false;
  private animationFrameId: number | null = null;
  private lastFrameTime: number | null = null;

  readonly DEFAULT_CHANNELS = ["left_distance", "right_distance", "imu_heading", "rangefinder_distance", "left_reflectance", "right_reflectance"]

  constructor(
    public telemetryDataService: TelemetryDataService,
  ) {
    this.telemetryDataService.onData$().subscribe((data) => {
      this.currentTimestamp$.next(data.getLatestTimestamp());
      this.latestTimestamp$.next(data.getLatestTimestamp());
    });
  }

  onPlaybackSlider(event: Event) {
    const timestamp = parseInt((event.target as HTMLInputElement).value);
    this.currentTimestamp$.next(timestamp);
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.startPlaying();
    } else {
      this.stopPlaying();
    }
  }

  private startPlaying() {

    // If we're already at the end, reset to the beginning
    if (this.currentTimestamp$.getValue() >= this.latestTimestamp$.getValue()) {
      this.currentTimestamp$.next(0);
    }

    this.animationFrameId = requestAnimationFrame(this.tick.bind(this));
  }

  private tick(timestamp: number) {

    // Advance the timestamp by the time between frames
    if (this.lastFrameTime !== null) {

      const timeBetweenFrames = Math.floor(timestamp - this.lastFrameTime);
      const newTimestamp = this.currentTimestamp$.getValue() + timeBetweenFrames;

      // If we've reached the end, stop playing
      if (newTimestamp >= this.latestTimestamp$.getValue()) {
        this.currentTimestamp$.next(this.latestTimestamp$.getValue());
        this.isPlaying = false;
        this.stopPlaying();
        return;
      } else {
        this.currentTimestamp$.next(newTimestamp);
      }
    }

    this.lastFrameTime = timestamp;

    // Tail recuring call to requestAnimationFrame
    if (this.isPlaying) this.animationFrameId = requestAnimationFrame(this.tick.bind(this));
  };

  // Detect left/right arrow key presses, and space to play/pause
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      this.left();
    } else if (event.key === 'ArrowRight') {
      this.right();
    } else if (event.key === ' ') {
      this.togglePlay();
    }
  }
  
  left() {
    this.stopPlaying();

    const timestamps = this.telemetryDataService.getData().getOrderedTimestamps();
    const currentTimestamp = this.currentTimestamp$.getValue();

    // Find the biggest timestamp in the timestamps array that is less than the current timestamp.
    const newTimestamp = timestamps.reduce((acc, val) => {
      if (val < currentTimestamp) return val;
      return acc;
    }, 0);

    this.currentTimestamp$.next(newTimestamp);
  }

  right() {
    this.stopPlaying();

    const timestamps = this.telemetryDataService.getData().getOrderedTimestamps();
    const currentTimestamp = this.currentTimestamp$.getValue();

    // Find the smallest timestamp in the timestamps array that is greater than the current timestamp.
    let newTimestamp = timestamps[timestamps.length - 1];
    for (const timestamp of timestamps) {
      if (timestamp > currentTimestamp) {
        newTimestamp = timestamp;
        break;
      }
    }

    this.currentTimestamp$.next(newTimestamp);
  }

  private stopPlaying() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.lastFrameTime = null;
  }

  ngOnDestroy() {
    this.stopPlaying();
  }

}
