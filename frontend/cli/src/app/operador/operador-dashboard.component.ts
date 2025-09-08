import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";

import { TurnoService } from "../turnos/turno.service";
import { OperadorService } from "./operador.service";

import { Turno } from "../turnos/turno";
import { NotificacionService } from "../services/notificacion.service";

@Component({
  selector: "app-operador-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="operador-dashboard">
      <!-- HEADER -->
      <div class="dashboard-header">
        <div class="welcome">
          <div class="icon"><i class="fas fa-user-cog"></i></div>
          <div class="texts">
            <h1>Panel Operador</h1>
            <p class="muted">Bienvenido/a, {{ operatorName || "Operador" }}</p>
            <p class="muted small" *ngIf="operatorEmail">
              <i class="fas fa-envelope me-2"></i>{{ operatorEmail }}
            </p>
          </div>
        </div>

        <div class="actions">
          <button class="btn btn-logout" (click)="logout()">
            <i class="fas fa-sign-out-alt"></i> Cerrar sesión
          </button>
        </div>
      </div>

      <!-- QUICK STATS -->
      <div class="quick-stats">
        <div class="stat-card">
          <div class="stat-title">Turnos Totales</div>
          <div class="stat-value">{{ stats.total }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Próximos</div>
          <div class="stat-value">{{ stats.upcoming }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Pendientes</div>
          <div class="stat-value">{{ stats.pending }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Cancelados</div>
          <div class="stat-value">{{ stats.cancelled }}</div>
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="quick-actions">
        <button class="action-btn" (click)="goToTurnos()">
          <i class="fas fa-calendar-alt"></i>
          Administrar Turnos
        </button>
        <button class="action-btn" (click)="goToCentros()">
          <i class="fas fa-hospital"></i>
          Gestionar Centros
        </button>
        <button class="action-btn" (click)="goToOperadores()">
          <i class="fas fa-users-cog"></i>
          Gestionar Operadores
        </button>
        <button class="action-btn" (click)="goToReportes()">
          <i class="fas fa-chart-line"></i>
          Ver Reportes
        </button>
      </div>

      <!-- FILTROS / BÚSQUEDA RÁPIDA -->
      <div class="filtro-rapido">
        <input
          type="text"
          class="form-control"
          placeholder="Buscar por paciente, médico, centro..."
          [(ngModel)]="quickFilter"
          (keyup.enter)="applyQuickFilter()"
        />
        <select
          class="form-select"
          [(ngModel)]="filtroEstado"
          (change)="applyQuickFilter()"
        >
          <option value="">Todos los estados</option>
          <option value="PROGRAMADO">PROGRAMADO</option>
          <option value="CONFIRMADO">CONFIRMADO</option>
          <option value="REAGENDADO">REAGENDADO</option>
          <option value="CANCELADO">CANCELADO</option>
          <option value="COMPLETO">COMPLETO</option>
        </select>
        <button class="btn btn-primary" (click)="applyQuickFilter()">
          Filtrar
        </button>
        <button class="btn btn-outline-secondary" (click)="resetFilters()">
          Reset
        </button>
      </div>

      <!-- LISTADO DE TURNOS (simple) -->
      <div class="turnos-list">
        <h3>Turnos recientes</h3>

        <div *ngIf="isLoading" class="loading">
          <i class="fas fa-spinner fa-spin"></i> Cargando turnos...
        </div>

        <div *ngIf="!isLoading && turnos.length === 0" class="empty">
          No hay turnos para mostrar
        </div>

        <div *ngIf="!isLoading && turnos.length > 0" class="table-responsive">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Paciente</th>
                <th>Médico</th>
                <th>Centro</th>
                <th>Estado</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of turnos; trackBy: trackByTurno">
                <td>{{ t.id }}</td>
                <td>{{ t.fecha }}</td>
                <td>{{ t.horaInicio }} - {{ t.horaFin }}</td>
                <td>{{ t.nombrePaciente }} {{ t.apellidoPaciente }}</td>
                <td>{{ t.staffMedicoNombre }} {{ t.staffMedicoApellido }}</td>
                <td>{{ t.nombreCentro }}</td>
                <td>
                  <span class="badge" [ngClass]="getBadgeClass(t.estado)">{{
                    t.estado
                  }}</span>
                </td>
                <td class="text-end">
                  <div class="btn-group">
                    <button
                      class="btn btn-sm btn-outline-primary"
                      (click)="confirmarTurno(t)"
                      [disabled]="!canConfirm(t)"
                    >
                      Confirmar
                    </button>
                    <button
                      class="btn btn-sm btn-outline-warning"
                      (click)="reagendarTurno(t)"
                      [disabled]="!canReschedule(t)"
                    >
                      Reagendar
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      (click)="cancelarTurno(t)"
                      [disabled]="!canCancel(t)"
                    >
                      Cancelar
                    </button>
                    <button
                      class="btn btn-sm btn-outline-info"
                      (click)="verDetalle(t.id)"
                    >
                      Ver
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .operador-dashboard {
        padding: 1.25rem;
        font-family: system-ui, -apple-system, "Segoe UI", Roboto,
          "Helvetica Neue", Arial;
      }
      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      .welcome {
        display: flex;
        gap: 1rem;
        align-items: center;
      }
      .welcome .icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        background: linear-gradient(135deg, #4f46e5, #06b6d4);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
      }
      .welcome h1 {
        margin: 0;
        font-size: 1.25rem;
      }
      .welcome .muted {
        color: #6b7280;
        margin: 0;
      }
      .actions .btn-logout {
        background: #ef4444;
        color: white;
        border: none;
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
      }
      .quick-stats {
        display: flex;
        gap: 1rem;
        margin: 1rem 0;
      }
      .stat-card {
        flex: 1;
        background: #fff;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
      }
      .stat-title {
        color: #6b7280;
        font-size: 0.85rem;
      }
      .stat-value {
        font-size: 1.6rem;
        font-weight: 700;
        margin-top: 0.25rem;
      }
      .quick-actions {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      .action-btn {
        background: #111827;
        color: white;
        border: none;
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
      .filtro-rapido {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 1rem;
      }
      .form-control,
      .form-select {
        padding: 0.5rem 0.5rem;
        border-radius: 6px;
        border: 1px solid #e5e7eb;
      }
      .turnos-list h3 {
        margin-top: 0;
        margin-bottom: 0.5rem;
      }
      .loading {
        color: #6b7280;
      }
      .badge {
        padding: 0.35rem 0.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
      }
      .badge.programado {
        background: linear-gradient(90deg, #f59e0b, #d97706);
        color: #111827;
      }
      .badge.confirmado {
        background: linear-gradient(90deg, #10b981, #059669);
        color: white;
      }
      .badge.reagendado {
        background: linear-gradient(90deg, #06b6d4, #0891b2);
        color: white;
      }
      .badge.cancelado {
        background: linear-gradient(90deg, #ef4444, #b91c1c);
        color: white;
      }
      .table {
        background: white;
        border-radius: 8px;
        overflow: hidden;
      }
      @media (max-width: 768px) {
        .quick-stats {
          flex-direction: column;
        }
        .quick-actions {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class OperadorDashboardComponent implements OnInit {
  operatorName = "";
  operatorEmail = "";
  operatorId: number | null = null;

  turnos: Turno[] = [];
  isLoading = false;

  // quick filters
  quickFilter = "";
  filtroEstado = "";

  // stats
  stats = { total: 0, upcoming: 0, pending: 0, cancelled: 0 };

  constructor(
    private router: Router,
    private turnoService: TurnoService,
    private operadorService: OperadorService,
    private notificacionService: NotificacionService //private authService: AuthService
  ) {
    //this.operatorEmail =
    //   this.authService.getUserEmail() ||
    //   localStorage.getItem("userEmail") ||
    //   "";
    // this.operatorName =
    //   this.authService.getUserName() || localStorage.getItem("userName") || "";
    // const idStr =
    //   localStorage.getItem("operadorId") || localStorage.getItem("userId");
    // this.operatorId = idStr ? parseInt(idStr, 10) : null;
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loadTurnos();
    this.loadStats();
    this.loadNotificationsCount();
  }

  loadTurnos() {
    this.isLoading = true;
    // Traer los turnos (puede ajustarse a paginado si hay muchos)
    this.turnoService.all().subscribe({
      next: (dp: any) => {
        const data = dp?.data || [];
        this.turnos = data;
        this.applyQuickFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error cargando turnos para operador:", err);
        this.isLoading = false;
      },
    });
  }

  loadStats() {
    // calcular stats simples a partir de this.turnos (si ya están) o pedir al backend
    // aquí hacemos cálculo local si ya cargamos turnos, sino mantenemos 0 y se actualizará al cargar turnos
    const compute = (turnos: any[]) => {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      this.stats.total = turnos.length;
      this.stats.upcoming = turnos.filter((t) => {
        const fecha = new Date(t.fecha);
        fecha.setHours(0, 0, 0, 0);
        return (
          fecha >= hoy &&
          ["PROGRAMADO", "CONFIRMADO", "REAGENDADO"].includes(
            (t.estado || "").toUpperCase()
          )
        );
      }).length;
      this.stats.pending = turnos.filter((t) =>
        ["PROGRAMADO", "PENDIENTE"].includes((t.estado || "").toUpperCase())
      ).length;
      this.stats.cancelled = turnos.filter(
        (t) => (t.estado || "").toUpperCase() === "CANCELADO"
      ).length;
    };

    // si ya tenemos turnos calculamos, si no pedimos y luego calculamos.
    if (this.turnos && this.turnos.length > 0) {
      compute(this.turnos);
    } else {
      this.turnoService.all().subscribe({
        next: (dp: any) => compute(dp?.data || []),
        error: (err) => console.error("Error calculando stats:", err),
      });
    }
  }

  loadNotificationsCount() {
    const operadorId = this.operatorId;
    if (!operadorId) return;
    // this.notificacionService.contarNotificacionesNoLeidasOperador(operadorId).subscribe({
    //   next: (count) => {
    //     // podés usar este valor para mostrar badge
    //     console.log('Notificaciones no leídas operador:', count);
    //   },
    //   error: (err) => console.error('Error cargando notificaciones:', err)
    // });
  }

  applyQuickFilter() {
    // filtros en memoria para mostrar resultados inmediatos
    const q = (this.quickFilter || "").toLowerCase().trim();
    const estado = (this.filtroEstado || "").toUpperCase().trim();

    let list = this.turnos || [];
    if (q) {
      list = list.filter(
        (t) =>
          (t.nombrePaciente || "").toLowerCase().includes(q) ||
          (t.apellidoPaciente || "").toLowerCase().includes(q) ||
          (t.staffMedicoNombre || "").toLowerCase().includes(q) ||
          (t.nombreCentro || "").toLowerCase().includes(q)
      );
    }
    if (estado) {
      list = list.filter((t) => (t.estado || "").toUpperCase() === estado);
    }
    this.turnos = list;
    this.loadStats(); // actualizar estadísticas locales (opcional)
  }

  resetFilters() {
    this.quickFilter = "";
    this.filtroEstado = "";
    // recargar (preferible recargar del backend si querés la lista completa)
    this.loadTurnos();
  }

  // === ACCIONES SOBRE TURNOS (usando TurnoService) ===
  confirmarTurno(turno: any) {
    if (!confirm(`Confirmar turno #${turno.id}?`)) return;
    this.turnoService.confirmar(turno.id).subscribe({
      next: () => {
        alert("Turno confirmado");
        this.loadTurnos();
      },
      error: (err) => {
        console.error("Error confirmando turno:", err);
        alert("No se pudo confirmar el turno");
      },
    });
  }

  reagendarTurno(turno: any) {
    // redirigir al flujo de reagendamiento (puede ser componente específico)
    this.router.navigate(["/turnos", turno.id], {
      queryParams: { reagenda: true },
    });
  }

  cancelarTurno(turno: any) {
    const motivo = prompt(
      "Ingrese motivo de cancelación (mínimo 5 caracteres):"
    );
    if (!motivo || motivo.trim().length < 5) {
      alert("Motivo inválido");
      return;
    }
    this.turnoService.cancelarConMotivo(turno.id, motivo.trim()).subscribe({
      next: () => {
        alert("Turno cancelado");
        this.loadTurnos();
      },
      error: (err) => {
        console.error("Error cancelando turno:", err);
        alert("No se pudo cancelar el turno");
      },
    });
  }

  verDetalle(turnoId?: number): void {
    if (turnoId == null) {
      // captura null o undefined
      console.warn("verDetalle: id de turno no disponible");
      return;
    }
    this.router.navigate(["/turnos", turnoId]);
  }

  // Permisos/validaciones simples
  canConfirm(turno: any): boolean {
    const s = (turno.estado || "").toUpperCase();
    return s === "PROGRAMADO" || s === "REAGENDADO";
  }
  canReschedule(turno: any): boolean {
    const s = (turno.estado || "").toUpperCase();
    return ["PROGRAMADO", "CONFIRMADO", "REAGENDADO"].includes(s);
  }
  canCancel(turno: any): boolean {
    const s = (turno.estado || "").toUpperCase();
    return ["PROGRAMADO", "CONFIRMADO", "REAGENDADO"].includes(s);
  }

  // utilidades
  trackByTurno(index: number, t: any) {
    return t.id || index;
  }
  getBadgeClass(estado: string) {
    const s = (estado || "").toLowerCase();
    return {
      programado: s === "programado",
      confirmado: s === "confirmado",
      reagendado: s === "reagendado",
      cancelado: s === "cancelado",
    };
  }

  // navegación rápida
  goToTurnos() {
    this.router.navigate(["/turnos"]);
  }
  goToCentros() {
    this.router.navigate(["/centros"]);
  }
  goToOperadores() {
    this.router.navigate(["/operadores"]);
  }
  goToReportes() {
    this.router.navigate(["/reportes"]);
  }

  logout() {
    //this.authService.logout();
    this.router.navigate(["/"]);
  }
}
