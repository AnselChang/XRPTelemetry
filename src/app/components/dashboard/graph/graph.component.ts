import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TelemetryData } from 'src/app/models/telemetry-data';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraphComponent implements OnChanges {
  @Input() data: TelemetryData = new TelemetryData();

  // Maps channel names to visibility
  visibleChannels$ = new BehaviorSubject<{[key in string] : boolean}>({});

  ngOnChanges(changes: SimpleChanges): void {
    console.log('GraphComponent::ngOnChanges', changes);
    
    const visibleChannels = this.visibleChannels$.getValue();

    // If any new channels are added, make them visible
    let changed = false;
    for (const channel of this.data.getChannelNames()) {
      if (visibleChannels[channel] === undefined) {
        visibleChannels[channel] = true;
        changed = true;
      }
    }
    // if changed, update with a copy of the object
    if (changed) this.visibleChannels$.next({...visibleChannels});
  }

  getChannelVisibility(channels: {[key in string] : boolean} | null, channel: string): boolean {
    return channels ? channels[channel] : false;
  }

  toggleChannelVisibility(channel: string): void {
    const visibleChannels = this.visibleChannels$.getValue();
    visibleChannels[channel] = !visibleChannels[channel];
    this.visibleChannels$.next({...visibleChannels});
  }

}