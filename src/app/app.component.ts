import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ListboxModule } from 'primeng/listbox';
import { ToastModule } from 'primeng/toast';
import { BehaviorSubject, Subscription, interval } from 'rxjs';

export interface PrintRequest {
  userId: number;
  document: string;
  priority: number;
  timeRemaining?: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    InputTextareaModule,
    ListboxModule,
    ToastModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'printer-queue';
  userId: number = 0;
  content: string = '';
  priority: number = 0;
  processingTime: number = 0;
  private queue: PrintRequest[] = [];
  private intervalSubscription!: Subscription;
  processingTimeChanges = new BehaviorSubject<number>(0);

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.intervalSubscription = interval(5000).subscribe(() => {
      this.processNextRequest();
    });
    this.processingTimeChanges.subscribe((time) => {
      this.processingTime = time;
    });
  }

  ngOnDestroy() {
    this.intervalSubscription.unsubscribe();
  }

  submitPrintRequest() {
    if (this.userId && this.content && this.priority !== undefined) {
      this.addRequest({
        userId: this.userId,
        document: this.content,
        priority: this.priority,
      });

      this.userId = 0;
      this.content = '';
      this.priority = 0;
    }
  }

  addRequest(request: PrintRequest): void {
    this.queue.push(request);
    this.queue.sort((a, b) => b.priority - a.priority); // Higher priority requests come first
  }

  processNextRequest(): void {
    if (this.queue.length > 0) {
      const request = this.queue.shift();
      console.log(
        `Processing request for user ${request?.userId}: ${request?.document}`
      );
      this.messageService.add({
        severity: 'info',
        summary: 'Print Processed',
        detail: `User ${request?.userId}'s request processed.`,
      });
    }
  }
  getPrintQueue() {
    return this.getQueue().map((request) => ({
      ...request,
      content: `User ID: ${request.userId}, Priority: ${request.priority}, Document: ${request.document}`,
    }));
  }

  getQueue(): PrintRequest[] {
    return this.queue;
  }
}
