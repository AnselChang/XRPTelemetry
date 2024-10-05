import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ContentComponent } from './components/content/content.component';
import { SidebarTabComponent } from './components/sidebar-tab/sidebar-tab.component';
import { DashboardPageComponent } from './components/dashboard/dashboard-page/dashboard-page.component';
import { ExercisesPageComponent } from './components/exercises/exercises-page/exercises-page.component';
import { GraphComponent } from './components/dashboard/graph/graph.component';
import { ChannelPanelComponent } from './components/dashboard/channel-panel/channel-panel.component';
import { GraphChannelComponent } from './components/dashboard/graph/graph-channel/graph-channel.component';
import { StatusComponent } from './components/sidebar/status/status.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    ContentComponent,
    SidebarTabComponent,
    DashboardPageComponent,
    ExercisesPageComponent,
    GraphComponent,
    ChannelPanelComponent,
    GraphChannelComponent,
    StatusComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
