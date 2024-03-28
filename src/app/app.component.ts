import { Component } from '@angular/core';
import { RequestFormComponent } from './components/request-form/request-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RequestFormComponent],
})
export class AppComponent {
  title = 'printer-queue';
}
