import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  private showSubject = new BehaviorSubject<boolean>(false);
  show$ = this.showSubject.asObservable();

  open(): void {
    this.showSubject.next(true);
  }

  close(): void {
    this.showSubject.next(false);
  }
}
