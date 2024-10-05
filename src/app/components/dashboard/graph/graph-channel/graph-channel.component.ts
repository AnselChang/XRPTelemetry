import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-graph-channel',
  templateUrl: './graph-channel.component.html',
  styleUrls: ['./graph-channel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraphChannelComponent {
  @Input() channel!: string;
  @Input() visible: boolean = true;
  @Output() visibleChange = new EventEmitter<boolean>();

  // on click, toggle visibility
  onClick() {
    this.visible = !this.visible;
    this.visibleChange.emit(this.visible);
  }

}
