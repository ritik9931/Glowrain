import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

const BASE_URL = 'http://localhost:5000/api/users';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private userSubject = new BehaviorSubject<any>(this.loadUser());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // ── Load from localStorage on startup ───────────────────
  private loadUser(): any {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  }

  // ── Login ────────────────────────────────────────────────
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${BASE_URL}/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('authToken', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.userSubject.next(res.user);
      })
    );
  }

  // ── Register ─────────────────────────────────────────────
  register(data: { name: string; email: string; password: string; phone_number: string }): Observable<any> {
    return this.http.post<any>(`${BASE_URL}/register`, data).pipe(
      tap(res => {
        localStorage.setItem('authToken', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.userSubject.next(res.user);
      })
    );
  }

  // ── Logout ───────────────────────────────────────────────
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  // ── Helpers ──────────────────────────────────────────────
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.userSubject.value?.is_admin === 'YES';
  }

  getCurrentUser(): any {
    return this.userSubject.value;
  }
}