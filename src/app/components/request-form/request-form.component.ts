import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ListboxModule } from 'primeng/listbox';
import { PrinterQueueService } from '../../services/printer-queue.service';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    InputTextareaModule,
    ListboxModule,
  ],
  template: `
    <form (ngSubmit)="submitPrintRequest()">
      <div class="p-field">
        <label for="userId">User ID:</label>
        <p-inputNumber
          [(ngModel)]="userId"
          name="userId"
          inputId="userId"
          [useGrouping]="false"
        ></p-inputNumber>
      </div>
      <div class="p-field">
        <label for="content">Content:</label>
        <textarea
          pInputTextarea
          [(ngModel)]="content"
          name="content"
          inputId="content"
          rows="5"
          cols="30"
        ></textarea>
      </div>
      <div class="p-field">
        <label for="priority">Priority:</label>
        <p-inputNumber
          [(ngModel)]="priority"
          name="priority"
          inputId="priority"
          [useGrouping]="false"
        ></p-inputNumber>
      </div>
      <p-button type="submit" label="Submit Request"></p-button>
    </form>
    <h2>Printer Queue</h2>
    <p-listbox [options]="getPrintQueue()" optionLabel="document">
      <ng-template let-request pTemplate="item">
        User ID: {{ request.userId }}, Priority: {{ request.priority }},
        Document: {{ request.document }}
      </ng-template>
    </p-listbox>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestFormComponent {
  userId: number = 0;
  content: string = '';
  priority: number = 0;

  constructor(private printerQueueService: PrinterQueueService) {}

  submitPrintRequest() {
    if (this.userId && this.content && this.priority !== undefined) {
      this.printerQueueService.addRequest({
        userId: this.userId,
        document: this.content,
        priority: this.priority,
      });
      // Reset form
      this.userId = 0;
      this.content = '';
      this.priority = 0;
    }
  }

  getPrintQueue() {
    return this.printerQueueService.getQueue().map((request) => ({
      ...request,
      content: `User ID: ${request.userId}, Priority: ${request.priority}, Document: ${request.document}`,
    }));
  }
}
