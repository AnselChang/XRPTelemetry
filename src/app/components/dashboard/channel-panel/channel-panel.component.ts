import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TelemetryData } from 'src/app/models/telemetry-data';
import { timestampToString } from 'src/app/util/timestamp';

interface ChannelData {
  name: string;
  value: number | string;
  timestamp: number;
  color: string;
}

@Component({
  selector: 'app-channel-panel',
  templateUrl: './channel-panel.component.html',
  styleUrls: ['./channel-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChannelPanelComponent implements OnChanges {
  @Input() data: TelemetryData = new TelemetryData();
  @Input() currentTimestamp: number = 0;
  @Input() defaultChannel?: string;

  channel$: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);

  readonly timestampToString = timestampToString;

  ngOnChanges(changes: SimpleChanges): void {
    // If no channel currently set, but default channel exists in data, set it
    if (!this.channel$.getValue() && this.defaultChannel && this.data.getChannelNames().includes(this.defaultChannel)) {
      this.channel$.next(this.defaultChannel);
    }
  }

  setChannel(channel: string | undefined): void {
    this.channel$.next(channel);
  }

  // Find the latest data point no later than the current timestamp
  getChannelData(channel: string | null | undefined): ChannelData | undefined {

    if (!channel) {
      return undefined;
    }

    const data = this.data.getAllDataForChannel(channel);
    let value: number | string = 0;
    let timestamp: number = 0;
    for (const point of data) {
      if (point.timestamp <= this.currentTimestamp) {
        value = point.value;
        timestamp = point.timestamp;
      } else {
        break;
      }
    }

    return {
      name: channel,
      value: value,
      timestamp: timestamp,
      color: this.data.getChannelColor(channel)
    }
  }

}
