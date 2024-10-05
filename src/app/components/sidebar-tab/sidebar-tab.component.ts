import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sidebar-tab',
  templateUrl: './sidebar-tab.component.html',
  styleUrls: ['./sidebar-tab.component.scss']
})
export class SidebarTabComponent {
  @Input() link!: string;
  @Input() label!: string;
  @Input() icon!: string;

  onTabClick() {
    
  }

}
