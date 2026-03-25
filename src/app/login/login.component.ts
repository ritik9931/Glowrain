import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup;
  submitted    = false;
  hidePassword = true;
  loading      = false;

  toast = { show: false, message: '', type: 'success' };
  private toastTimer: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }

    this.loginForm = this.fb.group({
      email:      ['', [Validators.required, Validators.email]],
      password:   ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Auto-fill remembered email
    const saved = localStorage.getItem('rememberedEmail');
    if (saved) {
      this.loginForm.patchValue({ email: saved, rememberMe: true });
    }
  }

  get f() { return this.loginForm.controls; }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    clearTimeout(this.toastTimer);
    this.toast = { show: true, message, type };
    this.toastTimer = setTimeout(() => this.toast.show = false, 3000);
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) return;

    const { email, password, rememberMe } = this.loginForm.value;

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    this.loading = true;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.loading = false;
        this.showToast(`Welcome back, ${res.user.name}!`);
        setTimeout(() => {
          // Admin goes to dashboard, regular user goes to home
          this.router.navigate(res.user.is_admin === 'YES' ? ['/dashboard'] : ['/pages/home']);
        }, 600);
      },
      error: (err) => {
        this.loading = false;
        this.showToast(err.error?.error || 'Login failed. Please try again.', 'error');
      }
    });
  }
}