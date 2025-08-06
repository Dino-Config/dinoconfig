import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { JsonPipe } from '@angular/common';
import { environment } from '../environments/environment';

@Component({
  imports: [RouterModule, JsonPipe],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private httpClient = inject(HttpClient);
  private api = this.httpClient.get(environment.apiUrl);
  
  protected apiResponse = toSignal(this.api);
}
