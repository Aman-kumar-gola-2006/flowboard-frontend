import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClick?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: Toast[] = [];
  private toastSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastSubject.asObservable();
  private nextId = 0;

  constructor() {}

  show(title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 5000, onClick?: () => void): void {
    const id = this.nextId++;
    const toast: Toast = { id, title, message, type, duration, onClick };
    this.toasts.push(toast);
    this.toastSubject.next([...this.toasts]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(title: string, message: string): void {
    this.show(title, message, 'success');
  }

  error(title: string, message: string): void {
    this.show(title, message, 'error');
  }

  info(title: string, message: string): void {
    this.show(title, message, 'info');
  }

  warning(title: string, message: string): void {
    this.show(title, message, 'warning');
  }

  remove(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toastSubject.next([...this.toasts]);
  }
}
