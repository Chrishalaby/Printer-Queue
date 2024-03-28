import { Injectable } from '@angular/core';
import { PrintRequest } from '../models/printing-request.model';

@Injectable({
  providedIn: 'root',
})
export class PrinterQueueService {
  private queue: PrintRequest[] = [];
  private timeoutRefs: any[] = [];

  constructor() {}

  addRequest(request: PrintRequest): void {
    this.queue.push(request);
    this.queue.sort((a, b) => b.priority - a.priority); // Higher priority requests come first
    this.setupTimeout();
  }

  private setupTimeout(): void {
    const timeoutRef = setTimeout(() => {
      this.processNextRequest();
    }, 15000);
    this.timeoutRefs.push(timeoutRef);
  }

  private processNextRequest(): void {
    if (this.queue.length > 0) {
      const request = this.queue.shift();
      console.log(
        `Processing request for user ${request?.userId}: ${request?.document}`
      );
    }
    this.cleanupTimeouts();
  }

  private cleanupTimeouts(): void {
    const timeoutRef = this.timeoutRefs.shift();
    clearTimeout(timeoutRef);
    if (this.queue.length > 0) {
      this.setupTimeout();
    }
  }

  getQueue(): PrintRequest[] {
    return this.queue;
  }
}
