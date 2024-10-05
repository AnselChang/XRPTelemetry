import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
  visibleChannels: {[key in string] : boolean} = {};

  ngOnChanges(changes: SimpleChanges): void {
    console.log('GraphComponent::ngOnChanges', changes);

    // If any new channels are added, make them visible
    for (const channel of this.data.getChannelNames()) {
      if (this.visibleChannels[channel] === undefined) {
        this.visibleChannels[channel] = true;
      }
    }

  }

}
