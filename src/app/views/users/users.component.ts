import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatSlideToggleModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule
  ],
})
export class UsersComponent implements OnInit {
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['username', 'fullName', 'f_creation', 'role', 'status'];
  loading: boolean = false;

  constructor(private apiService: ApiService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadUsers();
    
    // Configurar predicado de filtrado personalizado para buscar en el objeto anidado 'person'
    this.dataSource.filterPredicate = (data, filter: string) => {
      const roleLabel = this.getRoleLabel(data);
      const searchStr = (
        (data.username || '') + 
        (data.person?.first_name || '') + 
        (data.person?.last_name || '') + 
        (data.person?.identification || '') +
        roleLabel
      ).toLowerCase();
      return searchStr.indexOf(filter) !== -1;
    };
  }

  getRoleLabel(user: any): string {
    if (!user.userRoles || !Array.isArray(user.userRoles)) return 'Normal';
    const isAdmin = user.userRoles.some((ur: any) => ur.role?.name === 'ADMIN');
    return isAdmin ? 'Administrador' : 'Normal';
  }

  loadUsers(): void {
    this.loading = true;
    this.apiService.getAllUsers().subscribe({
      next: (data: any) => {
        console.log('DATOS RECIBIDOS DEL SERVIDOR:', data);
        let usersArray = [];
        if (Array.isArray(data)) {
          usersArray = data;
        } else if (data && data.users && Array.isArray(data.users)) {
          usersArray = data.users;
        } else {
          console.warn('La respuesta no tiene el formato de arreglo esperado.');
        }

        // ORDENAR: De la más actual a la más antigua
        usersArray.sort((a: any, b: any) => {
          const dateA = new Date(a.fcreation || a.f_creation || 0).getTime();
          const dateB = new Date(b.fcreation || b.f_creation || 0).getTime();
          return dateB - dateA; // Descendente: de mayor (nuevo) a menor (viejo)
        });

        this.dataSource.data = usersArray;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.toastr.error('No se pudo cargar la lista de usuarios');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  toggleUserStatus(user: any): void {
    const newStatus = !user.is_active;
    this.apiService.updateUserStatus(user.id_user, newStatus).subscribe({
      next: () => {
        user.is_active = newStatus; // Actualiza localmente si el backend tuvo éxito
        this.toastr.success(`Usuario ${newStatus ? 'habilitado' : 'deshabilitado'} correctamente`);
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        this.toastr.error('Error al intentar cambiar el estado del usuario');
      }
    });
  }
}
