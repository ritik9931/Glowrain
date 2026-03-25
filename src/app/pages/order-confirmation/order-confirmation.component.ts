import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.css'
})
export class OrderConfirmationComponent implements OnInit {

  order: any = null;
  orderId: string = '';

  ngOnInit() {
    const raw = localStorage.getItem('lastOrder');
    if (raw) {
      this.order = JSON.parse(raw);

      // Use real orderNumber from API e.g. "ORD00000003"
      // Falls back gracefully if older localStorage data is present
      this.orderId = this.order.orderNumber
        || (this.order.orderId ? `ORD${String(this.order.orderId).padStart(8, '0')}` : 'ORD' + Date.now().toString().slice(-8));
    }
  }
}