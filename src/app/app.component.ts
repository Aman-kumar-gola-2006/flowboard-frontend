import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/toast/toast.component';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, ConfirmModalComponent],
  template: `
    <app-toast></app-toast>
    <app-confirm-modal></app-confirm-modal>
    <router-outlet></router-outlet>
  `
})
export class AppComponent { }
