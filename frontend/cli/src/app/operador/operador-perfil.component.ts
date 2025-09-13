import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, ChangePasswordRequest, UpdateProfileRequest } from '../inicio-sesion/auth.service';
import { ModalService } from '../modal/modal.service';

@Component({
  selector: 'app-operador-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <div class="header-content">
          <div class="back-button">
            <button class="btn-back" (click)="goBack()">
              <i class="fas fa-arrow-left"></i>
              Volver
            </button>
          </div>
          <div class="header-info">
            <h1>Configuración de Perfil</h1>
            <p>Gestiona tu información personal y configuración como operador</p>
          </div>
        </div>
      </div>

      <div class="profile-content">
        <!-- Información Personal -->
        <div class="section-card">
          <div class="section-header">
            <i class="fas fa-user"></i>
            <h2>Información Personal</h2>
          </div>
          <div class="section-body">
            <form *ngIf="!editMode; else editForm">
              <div class="info-group">
                <label>Nombre:</label>
                <p>{{ userData.nombre || 'No especificado' }}</p>
              </div>
              <div class="info-group">
                <label>Apellido:</label>
                <p>{{ userData.apellido || 'No especificado' }}</p>
              </div>
              <div class="info-group">
                <label>Email:</label>
                <p>{{ userData.email }}</p>
              </div>
              <div class="info-group">
                <label>Teléfono:</label>
                <p>{{ userData.telefono || 'No especificado' }}</p>
              </div>
              <div class="info-group">
                <label>DNI:</label>
                <p>{{ userData.dni || 'No especificado' }}</p>
              </div>
              <div class="info-group">
                <label>Rol:</label>
                <p class="role-badge operador">{{ getUserRole() }}</p>
              </div>
              <button class="btn-secondary" type="button" (click)="editMode = true">
                <i class="fas fa-edit"></i> Editar Datos
              </button>
            </form>
            <ng-template #editForm>
              <div class="info-group">
                <label>Nombre:</label>
                <input class="form-control" [(ngModel)]="editUserData.nombre" name="nombre" required />
              </div>
              <div class="info-group">
                <label>Apellido:</label>
                <input class="form-control" [(ngModel)]="editUserData.apellido" name="apellido" />
              </div>
              <div class="info-group">
                <label>Email:</label>
                <input class="form-control" [(ngModel)]="editUserData.email" name="email" type="email" required />
              </div>
              <div class="info-group">
                <label>Teléfono:</label>
                <input class="form-control" [(ngModel)]="editUserData.telefono" name="telefono" />
              </div>
              <div class="info-group">
                <label>DNI:</label>
                <input class="form-control" [(ngModel)]="editUserData.dni" name="dni" />
              </div>
              <div class="info-group">
                <label>Rol:</label>
                <p class="role-badge operador">{{ getUserRole() }}</p>
              </div>
              <button class="btn-primary" type="button" (click)="savePersonalData()">
                <i class="fas fa-save"></i> Guardar
              </button>
              <button class="btn-secondary" type="button" (click)="cancelEdit()">
                Cancelar
              </button>
            </ng-template>
          </div>
        </div>

        <!-- Cambiar Contraseña -->
        <div class="section-card">
          <div class="section-header">
            <i class="fas fa-lock"></i>
            <h2>Seguridad</h2>
          </div>
          <div class="section-body">
            <div class="form-group">
              <label for="currentPassword">Contraseña Actual:</label>
              <input 
                type="password" 
                id="currentPassword"
                [(ngModel)]="changePasswordForm.currentPassword" 
                class="form-control"
                placeholder="Ingrese su contraseña actual">
            </div>
            <div class="form-group">
              <label for="newPassword">Nueva Contraseña:</label>
              <input 
                type="password" 
                id="newPassword"
                [(ngModel)]="changePasswordForm.newPassword" 
                class="form-control"
                placeholder="Ingrese la nueva contraseña">
            </div>
            <div class="form-group">
              <label for="confirmPassword">Confirmar Nueva Contraseña:</label>
              <input 
                type="password" 
                id="confirmPassword"
                [(ngModel)]="changePasswordForm.confirmPassword" 
                class="form-control"
                placeholder="Confirme la nueva contraseña">
            </div>
            <button class="btn-primary" (click)="changePassword()">
              <i class="fas fa-save"></i>
              Cambiar Contraseña
            </button>
          </div>
        </div>

        <!-- Configuración de Sistema -->
        <div class="section-card">
          <div class="section-header">
            <i class="fas fa-cog"></i>
            <h2>Configuración del Sistema</h2>
          </div>
          <div class="section-body">
            <div class="config-option">
              <input 
                type="checkbox" 
                id="notifications"
                [(ngModel)]="systemConfig.notifications">
              <label for="notifications">Recibir notificaciones por email</label>
            </div>
            <div class="config-option">
              <input 
                type="checkbox" 
                id="autoRefresh"
                [(ngModel)]="systemConfig.autoRefresh">
              <label for="autoRefresh">Actualización automática de datos</label>
            </div>
            <button class="btn-secondary" (click)="saveSystemConfig()">
              <i class="fas fa-save"></i>
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .profile-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 15px;
      margin-bottom: 30px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .btn-back {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.3s;
    }

    .btn-back:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .header-info h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
    }

    .header-info p {
      margin: 8px 0 0 0;
      opacity: 0.9;
    }

    .section-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 25px;
      overflow: hidden;
    }

    .section-header {
      background: #f8f9fa;
      padding: 20px;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .section-header i {
      color: #667eea;
      font-size: 1.2rem;
    }

    .section-header h2 {
      margin: 0;
      font-size: 1.3rem;
      color: #2c3e50;
    }

    .section-body {
      padding: 25px;
    }

    .info-group {
      margin-bottom: 20px;
    }

    .info-group label {
      font-weight: 600;
      color: #495057;
      display: block;
      margin-bottom: 5px;
    }

    .info-group p {
      margin: 0;
      color: #6c757d;
      font-size: 1.1rem;
    }

    .role-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .role-badge.operador {
      background: #e3f2fd;
      color: #1976d2;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      font-weight: 600;
      color: #495057;
      display: block;
      margin-bottom: 8px;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }

    .config-option {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }

    .config-option input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #667eea;
    }

    .config-option label {
      font-weight: 500;
      color: #495057;
      cursor: pointer;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: transform 0.2s;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: transform 0.2s;
    }

    .btn-secondary:hover {
      background: #545b62;
      transform: translateY(-2px);
    }
  `]
})
export class OperadorPerfilComponent implements OnInit {
  changePasswordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  systemConfig = {
    notifications: true,
    autoRefresh: true
  };

  userData = {
    nombre: '',
    email: '',
    apellido: '',
    telefono: '',
    dni: ''
  };
  editUserData = {
    nombre: '',
    email: '',
    apellido: '',
    telefono: '',
    dni: ''
  };
  editMode = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.loadUserConfig();
    this.loadUserData();
  }

  goBack() {
    this.router.navigate(['/operador-dashboard']);
  }

  getUserRole(): string {
    return this.authService.getUserRole() || 'No disponible';
  }

  loadUserData() {
    // Cargar datos básicos del token JWT
    this.userData.nombre = this.authService.getUserName() || '';
    this.userData.email = this.authService.getUserEmail() || '';
    
    // Intentar cargar datos adicionales del localStorage si existen
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        this.userData.apellido = currentUser.apellido || '';
        this.userData.telefono = currentUser.telefono || '';
        this.userData.dni = currentUser.dni || '';
        // Sobreescribir datos básicos si están en currentUser
        this.userData.nombre = currentUser.nombre || this.userData.nombre;
        this.userData.email = currentUser.email || this.userData.email;
      }
    } catch (error) {
      console.error('Error loading additional user data:', error);
    }
    
    this.editUserData = { ...this.userData };
  }

  editPersonalData() {
    this.editUserData = { ...this.userData };
    this.editMode = true;
  }

  cancelEdit() {
    this.editUserData = { ...this.userData };
    this.editMode = false;
  }

  savePersonalData() {
    // Validar datos antes de enviar
    if (!this.editUserData.nombre || !this.editUserData.email) {
      this.modalService.alert('Error', 'El nombre y el email son obligatorios');
      return;
    }

    // Preparar request para el backend
    const updateRequest: UpdateProfileRequest = {
      nombre: this.editUserData.nombre,
      apellido: this.editUserData.apellido || '',
      email: this.editUserData.email,
      telefono: this.editUserData.telefono || '',
      dni: this.editUserData.dni || ''
    };

    // Llamar al servicio para actualizar en backend
    this.authService.updateProfile(updateRequest).subscribe({
      next: (response) => {
        if (response.status_code === 200) {
          // Actualizar datos locales con la respuesta del servidor
          this.userData = { ...this.editUserData };
          this.editMode = false;
          this.modalService.alert('Éxito', 'Datos personales actualizados correctamente');
        } else {
          this.modalService.alert('Error', response.status_text || 'Error al actualizar los datos');
        }
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.modalService.alert('Error', 'Error al conectar con el servidor');
      }
    });
  }

  changePassword() {
    if (!this.changePasswordForm.currentPassword || 
        !this.changePasswordForm.newPassword || 
        !this.changePasswordForm.confirmPassword) {
      this.modalService.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (this.changePasswordForm.newPassword !== this.changePasswordForm.confirmPassword) {
      this.modalService.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (this.changePasswordForm.newPassword.length < 6) {
      this.modalService.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    const request: ChangePasswordRequest = {
      currentPassword: this.changePasswordForm.currentPassword,
      newPassword: this.changePasswordForm.newPassword,
      confirmPassword: this.changePasswordForm.confirmPassword
    };

    this.authService.changePassword(request).subscribe({
      next: () => {
        this.modalService.alert('Éxito', 'Contraseña cambiada correctamente');
        this.changePasswordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      },
      error: (error) => {
        const message = error?.error?.status_text || 'Error al cambiar la contraseña';
        this.modalService.alert('Error', message);
      }
    });
  }

  saveSystemConfig() {
    localStorage.setItem('operador-config', JSON.stringify(this.systemConfig));
    this.modalService.alert('Éxito', 'Configuración guardada correctamente');
  }

  private loadUserConfig() {
    const savedConfig = localStorage.getItem('operador-config');
    if (savedConfig) {
      this.systemConfig = { ...this.systemConfig, ...JSON.parse(savedConfig) };
    }
  }
}