import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardPageComponent } from './components/dashboard/dashboard-page/dashboard-page.component';
import { ExercisesPageComponent } from './components/exercises/exercises-page/exercises-page.component';

const routes: Routes = [
  { path: "dashboard", component: DashboardPageComponent },
  { path: "exercises", component: ExercisesPageComponent },

  { path: "", redirectTo: "dashboard", pathMatch: "full", },
  { path: "**", redirectTo: "dashboard", pathMatch: "full", }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
