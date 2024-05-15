import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ListboxModule } from 'primeng/listbox';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { Subscription, interval } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

export interface PrintRequest {
  userId: number;
  document: string;
  priority: number;
  timeRemaining?: number;
}

export interface User {
  id: number;
  password: string;
  priority: number;
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
    DialogModule,
    PasswordModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService, ConfirmationService],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'printer-queue';
  userId: number = 0;
  password: string = '';
  content: string = '';
  private queue: PrintRequest[] = [];
  private users: User[] = [];
  private adminUser = { id: 9999, password: 'admin' };
  private intervalSubscription: Subscription | null = null;

  displayAddUserDialog: boolean = false;
  displayAdminLoginDialog: boolean = false;
  newUserId: number = 0;
  newUserPassword: string = '';
  newUserPriority: number = 1;

  adminId: number = 0;
  adminPassword: string = '';

  currentRequest: PrintRequest | null = null;

  constructor(
    private messageService: MessageService,
    private zone: NgZone,
    private localStorageService: LocalStorageService,
    private cd: ChangeDetectorRef
  ) {
    this.users = [
      { id: 1, password: 'user1pass', priority: 3 },
      { id: 2, password: 'user2pass', priority: 2 },
      { id: 3, password: 'user3pass', priority: 4 },
    ];
  }

  ngOnInit() {
    this.setupInterval();
    this.fetchUsersFromLocalStorage();
  }

  setupInterval() {
    this.clearInterval();
    this.zone.runOutsideAngular(() => {
      this.intervalSubscription = interval(1000).subscribe(() => {
        this.zone.run(() => {
          this.updateProcessingTime();
        });
      });
    });
  }

  ngOnDestroy() {
    this.clearInterval();
  }

  submitPrintRequest() {
    const user = this.users.find(
      (u) => u.id === this.userId && u.password === this.password
    );

    if (user && this.content) {
      this.addRequest({
        userId: this.userId,
        document: this.content,
        priority: user.priority,
        timeRemaining: 15,
      });

      this.userId = 0;
      this.password = '';
      this.content = '';
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid user ID or password',
      });
    }
  }

  addRequest(request: PrintRequest): void {
    this.queue.push(request);
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  updateProcessingTime(): void {
    if (this.currentRequest) {
      if (this.currentRequest.timeRemaining! > 0) {
        this.currentRequest.timeRemaining!--;
        this.cd.detectChanges();
      } else {
        this.completeCurrentRequest();
      }
    } else {
      this.processNextRequest();
    }
  }

  processNextRequest(): void {
    if (this.queue.length > 0) {
      this.currentRequest = this.queue.shift()!;
      this.messageService.add({
        severity: 'info',
        summary: 'Print Started',
        detail: `Processing request for user ${this.currentRequest.userId}`,
      });
    }
  }

  completeCurrentRequest(): void {
    if (this.currentRequest) {
      this.messageService.add({
        severity: 'success',
        summary: 'Print Completed',
        detail: `User ${this.currentRequest.userId}'s request completed.`,
      });
      this.currentRequest = null;
      this.processNextRequest();
    }
  }

  getPrintQueue() {
    return this.queue.map((request) => ({
      ...request,
      content: `User ID: ${request.userId}, Priority: ${request.priority}, Document: ${request.document}, Time Remaining: ${request.timeRemaining}s`,
    }));
  }

  getQueue(): PrintRequest[] {
    return this.queue;
  }

  clearInterval() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
      this.intervalSubscription = null;
    }
  }

  showAdminLoginDialog() {
    this.displayAdminLoginDialog = true;
  }

  verifyAdmin() {
    if (
      this.adminId === this.adminUser.id &&
      this.adminPassword === this.adminUser.password
    ) {
      this.displayAdminLoginDialog = false;
      this.displayAddUserDialog = true;
      this.adminId = 0;
      this.adminPassword = '';
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid admin ID or password',
      });
    }
  }

  addUser() {
    const newUser: User = {
      id: this.newUserId,
      password: this.newUserPassword,
      priority: this.newUserPriority,
    };

    this.users.push(newUser);
    this.saveUserToLocalStorage(newUser);

    this.newUserId = 0;
    this.newUserPassword = '';
    this.newUserPriority = 1;

    this.displayAddUserDialog = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'New user added successfully',
    });
  }

  saveUserToLocalStorage(user: User) {
    const storedUsers = this.localStorageService.getItem('users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    users.push(user);
    this.localStorageService.setItem('users', JSON.stringify(users));
  }

  fetchUsersFromLocalStorage() {
    const storedUsers = this.localStorageService.getItem('users');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      this.users = [...this.users, ...users];
    }
  }
}
