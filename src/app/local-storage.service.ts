import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private localStorage: Storage;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.localStorage = window.localStorage;
    } else {
      this.localStorage = new MockLocalStorage();
    }
  }

  getItem(key: string): string | null {
    return this.localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    this.localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    this.localStorage.removeItem(key);
  }

  clear(): void {
    this.localStorage.clear();
  }
}

class MockLocalStorage implements Storage {
  private store: { [key: string]: string } = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] || null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
}
