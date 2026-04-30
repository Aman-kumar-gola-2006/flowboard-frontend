import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  private confirmSubject = new Subject<boolean>();
  private optionsSubject = new BehaviorSubject<ConfirmOptions | null>(null);
  
  options$ = this.optionsSubject.asObservable();

  confirm(options: ConfirmOptions): Promise<boolean> {
    this.optionsSubject.next({
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      type: 'warning',
      ...options
    });
    
    return new Promise((resolve) => {
      const subscription = this.confirmSubject.subscribe((result) => {
        subscription.unsubscribe();
        this.optionsSubject.next(null);
        resolve(result);
      });
    });
  }

  resolve(result: boolean): void {
    this.confirmSubject.next(result);
  }
}
