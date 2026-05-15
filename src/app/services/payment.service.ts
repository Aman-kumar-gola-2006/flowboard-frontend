import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  upgradeToPro(workspaceId: number): Observable<any> {
    const userId = this.authService.getUserId();
    
    return new Observable(observer => {
      if (!(window as any).Razorpay) {
        observer.error('Razorpay SDK not loaded');
        return;
      }

      this.http.post('/api/payments/create-order', { workspaceId, userId, amount: 99 })
        .subscribe({
          next: (res: any) => {
            const options = {
              key: res.keyId,
              amount: res.amount * 100,
              currency: res.currency,
              name: "FlowBoard PRO",
              description: "Upgrade to PRO Membership",
              order_id: res.orderId,
              handler: (response: any) => {
                this.http.post('/api/payments/verify', {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  workspaceId: workspaceId
                }).subscribe({
                  next: (verifyRes: any) => {
                    if (verifyRes.success) {
                      // Update local storage and notify auth service
                      this.authService.setProStatus(true);
                      observer.next(verifyRes);
                      observer.complete();
                    } else {
                      observer.error(verifyRes.message);
                    }
                  },
                  error: (err: any) => {
                    const errorMsg = err.error?.message || err.error?.error || 'Payment verification failed';
                    observer.error(errorMsg);
                  }
                });
              },
              prefill: {
                name: this.authService.getUserName(),
                email: this.authService.getUserEmail()
              },
              theme: {
                color: "#4F46E5"
              },
              modal: {
                ondismiss: () => {
                  observer.error('Payment cancelled');
                }
              }
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
          },
          error: (err: any) => {
            const errorMsg = err.error?.message || err.error?.error || 'Failed to create payment order';
            observer.error(errorMsg);
          }
        });
    });
  }
}
