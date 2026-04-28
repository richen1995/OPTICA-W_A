import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  imports: [CommonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule, MatProgressSpinnerModule]
})
export class LoginComponent {

  private router =  inject(Router);
  loginForm: FormGroup;
  hide = true;
  isLoading = false;

  constructor(private fb: FormBuilder, private apiService: ApiService, private toastr: ToastrService) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { username, password } = this.loginForm.value;
      this.apiService.login(username, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log("Respuesta del Backend de Login: ", response);
          if (response.token) {
            localStorage.setItem('token', response.token);
            
            // Intentar extraer el rol desde el token (JWT)
            try {
              const base64Url = response.token.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const payload = JSON.parse(window.atob(base64));
              console.log("Payload del Token Decodificado:", payload);

              // El id_role suele venir en 'id_role', 'roleId', 'role' o 'roles'
              const role = payload.id_role || payload.roleId || payload.role || (payload.roles ? payload.roles[0] : null);
              
              if (role) {
                // Si el rol es un string (ej: "ADMIN"), lo convertimos a 1
                const roleValue = (role === 'ADMIN' || role === 1) ? '1' : '2';
                localStorage.setItem('id_role', roleValue);
              }
            } catch (e) {
              console.error("Error al decodificar el token:", e);
            }

            // Si el backend devuelve el nombre, lo guardamos. 
            const displayName = response.firstName ? `${response.firstName} ${response.lastName}` : response.username;
            localStorage.setItem('user_name', displayName || username);
          }
          this.router.navigate(['/dashboard']);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          console.error('Error de login:', error);
          
          if (error.status === 0) {
            this.toastr.error('No se pudo conectar con el servidor. Por favor, verifique que el backend esté iniciado.', 'Error de Conexión');
          } else {
            const errorMessage = error.error?.error || 'Ocurrió un error inesperado al iniciar sesión.';
            this.toastr.error(errorMessage, 'Error de Login');
          }
        }
      });
    }
  }

  loginregister(){
    this.router.navigate(['/registerlogin']);
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}
