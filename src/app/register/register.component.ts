import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerForm: FormGroup;
  submitted    = false;
  hidePassword = true;
  hideConfirm  = true;
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
      this.router.navigate(['/pages/home']);
    }

    this.registerForm = this.fb.group({
      name:         ['', [Validators.required, Validators.minLength(3)]],
      email:        ['', [Validators.required, Validators.email]],
      phone_number: ['', [Validators.required, Validators.pattern('^[6-9]\\d{9}$')]],
      password:     ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator: password === confirmPassword
  passwordMatchValidator(form: FormGroup) {
    const p = form.get('password')?.value;
    const c = form.get('confirmPassword')?.value;
    if (p && c && p !== c) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      const errors = form.get('confirmPassword')?.errors;
      if (errors) {
        delete errors['mismatch'];
        const hasOtherErrors = Object.keys(errors).length > 0;
        form.get('confirmPassword')?.setErrors(hasOtherErrors ? errors : null);
      }
    }
    return null;
  }

  get f() { return this.registerForm.controls; }

  togglePassword() { this.hidePassword = !this.hidePassword; }
  toggleConfirm()  { this.hideConfirm  = !this.hideConfirm; }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    clearTimeout(this.toastTimer);
    this.toast = { show: true, message, type };
    this.toastTimer = setTimeout(() => this.toast.show = false, 3000);
  }

  onSubmit() {
    this.submitted = true;
    if (this.registerForm.invalid) return;

    this.loading = true;

    const { name, email, phone_number, password } = this.registerForm.value;

    this.authService.register({ name, email, phone_number, password }).subscribe({
      next: (res) => {
        this.loading = false;
        this.showToast(`Welcome, ${res.user.name}! Account created.`);
        setTimeout(() => this.router.navigate(['/pages/home']), 700);
      },
      error: (err) => {
        this.loading = false;
        this.showToast(err.error?.error || 'Registration failed. Try again.', 'error');
      }
    });
  }
}