import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import {
  ReactiveFormsModule, FormBuilder,
  FormGroup, Validators
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CartService } from '../../services/cart.service';

const BASE_URL = 'http://localhost:5000';

declare var Cashfree: any; // Cashfree JS SDK

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HttpClientModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {

  addressForm!: FormGroup;
  cartItems:    any[] = [];
  step:         1 | 2 = 1;
  placing       = false;
  paymentMode:  'COD' | 'ONLINE' = 'COD';

  toast = { show: false, message: '', type: 'success' };
  private toastTimer: any;

  readonly DELIVERY_CHARGE = 0;
  readonly STATES = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
    'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
    'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
    'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
    'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
    'Delhi','Jammu & Kashmir','Ladakh','Puducherry'
  ];

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items.map(item => ({
        ...item,
        image: item.image
          ? item.image
          : item.img1 ? `${BASE_URL}/${item.img1}` : 'assets/images/placeholder.png'
      }));
    });

    this.addressForm = this.fb.group({
      fullName:  ['', [Validators.required, Validators.minLength(3)]],
      phone:     ['', [Validators.required, Validators.pattern('^[6-9]\\d{9}$')]],
      pincode:   ['', [Validators.required, Validators.pattern('^[1-9][0-9]{5}$')]],
      address:   ['', [Validators.required, Validators.minLength(10)]],
      city:      ['', Validators.required],
      state:     ['', Validators.required],
      landmark:  [''],
      saveAddr:  [false]
    });

    // Load Cashfree JS SDK
    this.loadCashfreeSDK();
  }

  loadCashfreeSDK() {
    if (document.getElementById('cashfree-sdk')) return;
    const script    = document.createElement('script');
    script.id       = 'cashfree-sdk';
    script.src      = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async    = true;
    document.head.appendChild(script);
  }

  get f() { return this.addressForm.controls; }

  getSubtotal(): number {
    return this.cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  }

  getItemCount(): number {
    return this.cartItems.reduce((s, i) => s + i.quantity, 0);
  }

  getTotal(): number {
    return this.getSubtotal() + this.DELIVERY_CHARGE;
  }

  selectPaymentMode(mode: 'COD' | 'ONLINE') {
    this.paymentMode = mode;
  }

  goToReview() {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      this.showToast('Please fill all required fields correctly', 'error');
      return;
    }
    this.step = 2;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBack() {
    this.step = 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Place Order ──────────────────────────────────────────
  placeOrder() {
    if (this.paymentMode === 'COD') {
      this.placeCODOrder();
    } else {
      this.placeOnlineOrder();
    }
  }

  // ── COD Order ────────────────────────────────────────────
  placeCODOrder() {
    this.placing = true;

    const payload = this.buildPayload('COD');

    this.http.post<any>(`${BASE_URL}/api/orders/placeOrder`, payload).subscribe({
      next: (res) => {
        this.saveLastOrder(payload, res);
        this.cartService.clearCart();
        this.placing = false;
        this.router.navigate(['/order-confirmation']);
      },
      error: () => {
        this.showToast('Failed to place order. Please try again.', 'error');
        this.placing = false;
      }
    });
  }

  // ── Online Payment via Cashfree ──────────────────────────
  placeOnlineOrder() {
    this.placing = true;

    const payload = this.buildPayload('ONLINE');

    // Step 1: Create Cashfree order on backend
    this.http.post<any>(`${BASE_URL}/api/orders/createCashfreeOrder`, payload).subscribe({
      next: (res) => {
        this.placing = false;

        const { orderId, orderNumber, cfOrderId, paymentSessionId } = res;

        // Step 2: Open Cashfree checkout
        const cashfree = new Cashfree({ mode: 'sandbox' });

        cashfree.checkout({
          paymentSessionId,
          redirectTarget: '_modal',
        }).then((result: any) => {

          if (result.error) {
            this.showToast('Payment failed: ' + result.error.message, 'error');
            return;
          }

          if (result.paymentDetails) {
            // Step 3: Verify payment on backend
            this.verifyPayment(orderId, cfOrderId, payload);
          }
        });
      },
      error: (err) => {
        this.placing = false;
        this.showToast(err.error?.error || 'Failed to initiate payment', 'error');
      }
    });
  }

  // ── Verify Payment ───────────────────────────────────────
  verifyPayment(orderId: number, cfOrderId: string, payload: any) {
    this.placing = true;

    this.http.post<any>(`${BASE_URL}/api/orders/verifyCashfreePayment`, {
      orderId,
      cfOrderId
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.saveLastOrder(payload, {
            orderId,
            orderNumber: `ORD${String(orderId).padStart(8, '0')}`,
            paymentId: res.paymentId
          });
          this.cartService.clearCart();
          this.placing = false;
          this.router.navigate(['/order-confirmation']);
        } else {
          this.showToast('Payment verification failed', 'error');
          this.placing = false;
        }
      },
      error: () => {
        this.showToast('Payment verification failed. Contact support.', 'error');
        this.placing = false;
      }
    });
  }

  // ── Helpers ──────────────────────────────────────────────
  buildPayload(paymentMode: string) {
    return {
      address:     this.addressForm.value,
      items:       this.cartItems.map(i => ({
        id: i.id, name: i.name, price: i.price,
        quantity: i.quantity, image: i.image || null
      })),
      subtotal:    this.getSubtotal(),
      delivery:    this.DELIVERY_CHARGE,
      total:       this.getTotal(),
      paymentMode
    };
  }

  saveLastOrder(payload: any, res: any) {
    localStorage.setItem('lastOrder', JSON.stringify({
      ...payload,
      orderId:     res.orderId,
      orderNumber: res.orderNumber
    }));
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    clearTimeout(this.toastTimer);
    this.toast = { show: true, message, type };
    this.toastTimer = setTimeout(() => this.toast.show = false, 3500);
  }

  hasError(field: string): boolean {
    const c = this.addressForm.get(field);
    return !!(c && c.invalid && c.touched);
  }
}