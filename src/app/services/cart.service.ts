import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const CART_KEY = 'ritik_cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cartItems = new BehaviorSubject<any[]>(this.loadFromStorage());
  cart$ = this.cartItems.asObservable();

  // ── Load from localStorage on startup ───────────────────
  private loadFromStorage(): any[] {
    try {
      const data = localStorage.getItem(CART_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // ── Save to localStorage on every change ────────────────
  private save(items: any[]) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    this.cartItems.next(items);
  }

  // ── Add item ─────────────────────────────────────────────
  addToCart(product: any) {
    const items = this.cartItems.value;
    const existing = items.find(p => p.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ ...product, quantity: 1 });
    }

    this.save([...items]);
  }

  // ── Decrease qty, remove if hits 0 ──────────────────────
  decreaseQty(productId: number) {
    const items = this.cartItems.value;
    const existing = items.find(p => p.id === productId);
    if (!existing) return;

    if (existing.quantity === 1) {
      this.save(items.filter(p => p.id !== productId));
    } else {
      existing.quantity -= 1;
      this.save([...items]);
    }
  }

  // ── Remove item entirely ─────────────────────────────────
  removeItem(id: number) {
    this.save(this.cartItems.value.filter(p => p.id !== id));
  }

  // ── Get total price ──────────────────────────────────────
  getTotal(): number {
    return this.cartItems.value.reduce(
      (total, item) => total + item.price * item.quantity, 0
    );
  }

  // ── Clear cart (call after successful order) ─────────────
  clearCart() {
    localStorage.removeItem(CART_KEY);
    this.cartItems.next([]);
  }
}