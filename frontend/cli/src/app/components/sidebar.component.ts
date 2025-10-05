import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MenuService } from '../services/menu.service';
import { UserContextService, UserContext } from '../services/user-context.service';
import { AuthService } from '../inicio-sesion/auth.service';
import { MenuSection, MenuItem } from '../config/menu.config';

/**
 * Componente del menú lateral (sidebar) dinámico basado en roles
 * 
 * Características:
 * - Menú adaptativo según roles del usuario
 * - Colapso/expansión de secciones
 * - Badges de notificaciones
 * - Responsive (mobile/desktop)
 * - Highlighting de ruta activa
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <aside 
      class="sidebar" 
      [class.sidebar--open]="(menuService.sidebarState$ | async)?.isOpen"
      [class.sidebar--mobile]="(menuService.sidebarState$ | async)?.isMobile"
    >
      <!-- Header del Sidebar -->
      <div class="sidebar__header">
        <div class="sidebar__brand">
          <i class="fas fa-calendar-check sidebar__brand-icon"></i>
          <span class="sidebar__brand-text">CheTurno</span>
        </div>
        <button 
          class="sidebar__toggle" 
          (click)="menuService.toggleSidebar()"
          aria-label="Toggle sidebar"
        >
          <i class="fas fa-bars"></i>
        </button>
      </div>

      <!-- User Info -->
      <div class="sidebar__user" *ngIf="userContext$ | async as userContext">
        <div class="sidebar__user-avatar">
          <i class="fas fa-user-circle"></i>
        </div>
        <div class="sidebar__user-info">
          <div class="sidebar__user-name">{{ userContext.nombre }}</div>
          <div class="sidebar__user-role">{{ getRoleDisplay(userContext.primaryRole) }}</div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar__nav">
        
        <!-- Items Compartidos -->
        <div class="sidebar__section" *ngIf="(menuService.sharedItems$ | async)?.length">
          <div class="sidebar__section-header">
            <i class="fas fa-home sidebar__section-icon"></i>
            <span class="sidebar__section-title">General</span>
          </div>
          <ul class="sidebar__menu">
            <li 
              *ngFor="let item of menuService.sharedItems$ | async"
              class="sidebar__menu-item"
              [class.sidebar__menu-item--active]="isActiveRoute(item.route)"
            >
              <a 
                [routerLink]="item.route" 
                class="sidebar__menu-link"
                [attr.title]="item.description"
              >
                <i class="fas {{ item.icon }} sidebar__menu-icon"></i>
                <span class="sidebar__menu-label">{{ item.label }}</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Secciones por Rol -->
        <div 
          *ngFor="let section of menuSectionsWithBadges$ | async"
          class="sidebar__section"
        >
          <!-- Header de Sección -->
          <div class="sidebar__section-header">
            <i class="fas {{ section.icon }} sidebar__section-icon"></i>
            <span class="sidebar__section-title">{{ section.label }}</span>
          </div>

          <!-- Items de la Sección (siempre visibles) -->
          <ul class="sidebar__menu">
            <ng-container *ngFor="let item of section.items">
              
              <!-- Divider -->
              <li *ngIf="item.divider" class="sidebar__divider"></li>
              
              <!-- Menu Item Normal -->
              <li 
                *ngIf="!item.divider"
                class="sidebar__menu-item"
                [class.sidebar__menu-item--active]="isActiveRoute(item.route)"
              >
                <a 
                  *ngIf="item.route"
                  [routerLink]="item.route" 
                  class="sidebar__menu-link"
                  [attr.title]="item.description"
                  (click)="onItemClick()"
                >
                  <i class="fas {{ item.icon }} sidebar__menu-icon"></i>
                  <span class="sidebar__menu-label">{{ item.label }}</span>
                  
                  <!-- Badge de Notificaciones -->
                  <span 
                    *ngIf="item.badge && item.badge.value" 
                    class="sidebar__badge sidebar__badge--{{ item.badge.color }}"
                  >
                    {{ item.badge.value }}
                  </span>
                </a>

                <!-- Item con Acción (no navegación) -->
                <button
                  *ngIf="item.action && !item.route"
                  class="sidebar__menu-link sidebar__menu-link--button"
                  (click)="item.action(); onItemClick()"
                  [attr.title]="item.description"
                >
                  <i class="fas {{ item.icon }} sidebar__menu-icon"></i>
                  <span class="sidebar__menu-label">{{ item.label }}</span>
                </button>
              </li>
            </ng-container>
          </ul>
        </div>

      </nav>

      <!-- Footer del Sidebar -->
      <div class="sidebar__footer">
        <button 
          class="sidebar__footer-btn"
          (click)="logout()"
          title="Cerrar sesión"
        >
          <i class="fas fa-sign-out-alt"></i>
          <span>Cerrar Sesión</span>
        </button>
      </div>

      <!-- Overlay para Mobile -->
      <div 
        class="sidebar__overlay"
        *ngIf="(menuService.sidebarState$ | async)?.isMobile && (menuService.sidebarState$ | async)?.isOpen"
        (click)="menuService.closeSidebar()"
      ></div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 280px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 10px rgba(0,0,0,0.1);
    }

    .sidebar--open {
      transform: translateX(0);
    }

    .sidebar__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .sidebar__brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .sidebar__brand-icon {
      font-size: 1.5rem;
      color: #ffd700;
    }

    .sidebar__brand-text {
      font-size: 1.25rem;
      font-weight: 700;
    }

    .sidebar__toggle {
      background: rgba(255,255,255,0.1);
      border: none;
      color: white;
      padding: 0.5rem;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .sidebar__toggle:hover {
      background: rgba(255,255,255,0.2);
    }

    .sidebar__user {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: rgba(255,255,255,0.1);
      margin: 1rem;
      border-radius: 0.5rem;
    }

    .sidebar__user-avatar {
      font-size: 2.5rem;
      color: rgba(255,255,255,0.9);
    }

    .sidebar__user-info {
      flex: 1;
      min-width: 0;
    }

    .sidebar__user-name {
      font-weight: 600;
      font-size: 0.95rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sidebar__user-role {
      font-size: 0.75rem;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .sidebar__nav {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem 0;
    }

    .sidebar__section {
      margin-bottom: 1.5rem;
    }

    .sidebar__section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.9;
    }

    .sidebar__section-icon {
      font-size: 1rem;
    }

    .sidebar__section-title {
      flex: 1;
    }

    .sidebar__menu {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .sidebar__menu-item {
      position: relative;
    }

    .sidebar__menu-item--active .sidebar__menu-link {
      background: rgba(255,255,255,0.2);
      border-left: 3px solid #ffd700;
    }

    .sidebar__menu-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: white;
      text-decoration: none;
      transition: all 0.2s;
      border-left: 3px solid transparent;
    }

    .sidebar__menu-link:hover {
      background: rgba(255,255,255,0.15);
    }

    .sidebar__menu-link--button {
      width: 100%;
      background: transparent;
      border: none;
      cursor: pointer;
      text-align: left;
      font-family: inherit;
      font-size: inherit;
    }

    .sidebar__menu-icon {
      font-size: 1.1rem;
      width: 1.25rem;
      text-align: center;
    }

    .sidebar__menu-label {
      flex: 1;
      font-size: 0.9rem;
    }

    .sidebar__badge {
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
      font-size: 0.7rem;
      font-weight: 600;
      min-width: 1.5rem;
      text-align: center;
    }

    .sidebar__badge--danger {
      background: #ef4444;
    }

    .sidebar__badge--warning {
      background: #f59e0b;
    }

    .sidebar__badge--success {
      background: #10b981;
    }

    .sidebar__badge--info {
      background: #3b82f6;
    }

    .sidebar__badge--primary {
      background: #8b5cf6;
    }

    .sidebar__divider {
      height: 1px;
      background: rgba(255,255,255,0.1);
      margin: 0.5rem 1rem;
    }

    .sidebar__footer {
      padding: 1rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .sidebar__footer-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: rgba(255,255,255,0.1);
      border: none;
      color: white;
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: background 0.2s;
    }

    .sidebar__footer-btn:hover {
      background: rgba(255,255,255,0.2);
    }

    .sidebar__overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 999;
    }

    /* Responsive */
    @media (min-width: 768px) {
      .sidebar {
        transform: translateX(0);
      }

      .sidebar__toggle {
        display: none;
      }
    }

    @media (max-width: 767px) {
      .sidebar {
        width: 100%;
        max-width: 320px;
      }
    }

    /* Scrollbar personalizado */
    .sidebar__nav::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar__nav::-webkit-scrollbar-track {
      background: rgba(255,255,255,0.1);
    }

    .sidebar__nav::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.3);
      border-radius: 3px;
    }

    .sidebar__nav::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.5);
    }
  `],
  animations: [
    // Puedes agregar animaciones Angular aquí si lo deseas
  ]
})
export class SidebarComponent implements OnInit, OnDestroy {
  
  public userContext$!: Observable<UserContext | null>;
  public menuSectionsWithBadges$!: Observable<MenuSection[]>;
  
  private subscriptions: Subscription[] = [];
  private currentRoute = '';

  constructor(
    public menuService: MenuService,
    private userContextService: UserContextService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Inicializar observables
    this.userContext$ = this.userContextService.userContext$;
    this.menuSectionsWithBadges$ = this.menuService.getMenuSectionsWithBadges();
    
    // Suscribirse a cambios de ruta para highlight
    const routeSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
        
        // En mobile, cerrar sidebar después de navegar
        this.menuService.sidebarState$.subscribe(state => {
          if (state.isMobile && state.isOpen) {
            this.menuService.closeSidebar();
          }
        }).unsubscribe();
      });
    
    this.subscriptions.push(routeSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Verifica si una ruta está activa
   */
  isActiveRoute(route?: string): boolean {
    if (!route) return false;
    return this.currentRoute === route || this.currentRoute.startsWith(route + '/');
  }

  /**
   * Maneja el click en un item del menú
   */
  onItemClick(): void {
    // Cerrar sidebar en mobile después de un pequeño delay
    setTimeout(() => {
      this.menuService.sidebarState$.subscribe(state => {
        if (state.isMobile) {
          this.menuService.closeSidebar();
        }
      }).unsubscribe();
    }, 100);
  }

  /**
   * Cierra la sesión
   */
  logout(): void {
    this.authService.logout();
  }

  /**
   * Obtiene el nombre display del rol
   */
  getRoleDisplay(role: string): string {
    const roleMap: Record<string, string> = {
      'PACIENTE': 'Paciente',
      'MEDICO': 'Médico',
      'OPERADOR': 'Operador',
      'ADMINISTRADOR': 'Administrador'
    };
    return roleMap[role] || role;
  }
}
