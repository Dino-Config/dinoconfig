import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NotificationComponent } from './components/shared/notification/notification.component';

@Component({
  imports: [RouterModule, NotificationComponent],
  selector: 'dc-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'dinoconfig-builder';
}
