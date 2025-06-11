import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditDropdownService } from './audit-dropdown.service';

interface AdvancedSearchFilters {
  searchTerm: string;
  estado: string;
  fechaDesde: string;
  fechaHasta: string;
  centroId: string;
  especialidadId: string;
  staffMedicoId: string;
  pacienteId: string;
  tipoAuditoria: string;
  severidad: string;
  conConflictos: boolean;
  soloValidados: boolean;
  incluirCancelados: boolean;
}

@Component({
  selector: 'app-audit-advanced-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="advanced-search" [class.expanded]="isExpanded">
      <div class="search-header" (click)="toggle()">
        <h3>
          <i class="fas fa-search-plus"></i>
          Búsqueda Avanzada
        </h3>
        <button class="toggle-btn" type="button">
          <i class="fas" [class.fa-chevron-down]="!isExpanded" [class.fa-chevron-up]="isExpanded"></i>
        </button>
      </div>

      <div class="search-content" *ngIf="isExpanded">
        <!-- Basic Search -->
        <div class="search-section">
          <h4>Búsqueda General</h4>
          <div class="search-row">
            <div class="search-field full-width">
              <label>Término de búsqueda</label>
              <div class="search-input-group">
                <input 
                  type="text" 
                  [(ngModel)]="filters.searchTerm"
                  placeholder="Buscar por paciente, médico, ID de turno..."
                  class="form-control">
                <button 
                  type="button" 
                  class="search-suggestion-btn"
                  (click)="showSearchSuggestions = !showSearchSuggestions">
                  <i class="fas fa-lightbulb"></i>
                </button>
              </div>
              <div class="search-suggestions" *ngIf="showSearchSuggestions">
                <div class="suggestion-item" (click)="applySuggestion('paciente:')">
                  <strong>paciente:</strong> Buscar por nombre de paciente
                </div>
                <div class="suggestion-item" (click)="applySuggestion('medico:')">
                  <strong>médico:</strong> Buscar por nombre de médico
                </div>
                <div class="suggestion-item" (click)="applySuggestion('id:')">
                  <strong>id:</strong> Buscar por ID de turno específico
                </div>
                <div class="suggestion-item" (click)="applySuggestion('centro:')">
                  <strong>centro:</strong> Buscar por centro de atención
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Date Range -->
        <div class="search-section">
          <h4>Rango de Fechas</h4>
          <div class="search-row">
            <div class="search-field">
              <label>Fecha desde</label>
              <input 
                type="date" 
                [(ngModel)]="filters.fechaDesde"
                class="form-control">
            </div>
            <div class="search-field">
              <label>Fecha hasta</label>
              <input 
                type="date" 
                [(ngModel)]="filters.fechaHasta"
                class="form-control">
            </div>
            <div class="search-field">
              <label>Rango rápido</label>
              <select (change)="applyQuickDateRange($event)" class="form-control">
                <option value="">Seleccionar rango</option>
                <option value="today">Hoy</option>
                <option value="yesterday">Ayer</option>
                <option value="this_week">Esta semana</option>
                <option value="last_week">Semana pasada</option>
                <option value="this_month">Este mes</option>
                <option value="last_month">Mes pasado</option>
                <option value="last_3_months">Últimos 3 meses</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Location and Resources -->
        <div class="search-section">
          <h4>Ubicación y Recursos</h4>
          <div class="search-row">
            <div class="search-field">
              <label>Centro de Atención</label>
              <select [(ngModel)]="filters.centroId" class="form-control">
                <option value="">Todos los centros</option>
                <option *ngFor="let centro of centros" [value]="centro.value">
                  {{ centro.label }}
                </option>
              </select>
            </div>
            <div class="search-field">
              <label>Especialidad</label>
              <select [(ngModel)]="filters.especialidadId" class="form-control">
                <option value="">Todas las especialidades</option>
                <option *ngFor="let especialidad of especialidades" [value]="especialidad.value">
                  {{ especialidad.label }}
                </option>
              </select>
            </div>
            <div class="search-field">
              <label>Médico</label>
              <select [(ngModel)]="filters.staffMedicoId" class="form-control">
                <option value="">Todos los médicos</option>
                <option *ngFor="let medico of medicos" [value]="medico.value">
                  {{ medico.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Status and Type -->
        <div class="search-section">
          <h4>Estado y Tipo</h4>
          <div class="search-row">
            <div class="search-field">
              <label>Estado del Turno</label>
              <select [(ngModel)]="filters.estado" class="form-control">
                <option value="">Todos los estados</option>
                <option value="PROGRAMADO">Programado</option>
                <option value="CONFIRMADO">Confirmado</option>
                <option value="REAGENDADO">Reagendado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
            <div class="search-field">
              <label>Tipo de Auditoría</label>
              <select [(ngModel)]="filters.tipoAuditoria" class="form-control">
                <option value="">Todos los tipos</option>
                <option value="MANUAL">Manual</option>
                <option value="AUTOMATICA">Automática</option>
                <option value="PROGRAMADA">Programada</option>
                <option value="REACTIVA">Reactiva</option>
              </select>
            </div>
            <div class="search-field">
              <label>Severidad</label>
              <select [(ngModel)]="filters.severidad" class="form-control">
                <option value="">Todas las severidades</option>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Advanced Options -->
        <div class="search-section">
          <h4>Opciones Avanzadas</h4>
          <div class="search-row">
            <div class="search-field">
              <label>ID Paciente</label>
              <input 
                type="number" 
                [(ngModel)]="filters.pacienteId"
                placeholder="ID específico del paciente"
                class="form-control">
            </div>
            <div class="search-field checkbox-group">
              <div class="checkbox-item">
                <input 
                  type="checkbox" 
                  id="conConflictos"
                  [(ngModel)]="filters.conConflictos">
                <label for="conConflictos">Solo con conflictos</label>
              </div>
              <div class="checkbox-item">
                <input 
                  type="checkbox" 
                  id="soloValidados"
                  [(ngModel)]="filters.soloValidados">
                <label for="soloValidados">Solo validados</label>
              </div>
              <div class="checkbox-item">
                <input 
                  type="checkbox" 
                  id="incluirCancelados"
                  [(ngModel)]="filters.incluirCancelados">
                <label for="incluirCancelados">Incluir cancelados</label>
              </div>
            </div>
          </div>
        </div>

        <!-- Search Actions -->
        <div class="search-actions">
          <div class="saved-searches">
            <select class="form-control" (change)="loadSavedSearch($event)">
              <option value="">Búsquedas guardadas</option>
              <option *ngFor="let search of savedSearches" [value]="search.id">
                {{ search.name }}
              </option>
            </select>
            <button type="button" class="btn btn-outline" (click)="saveCurrentSearch()">
              <i class="fas fa-bookmark"></i>
              Guardar
            </button>
          </div>
          
          <div class="action-buttons">
            <button type="button" class="btn btn-secondary" (click)="clearFilters()">
              <i class="fas fa-eraser"></i>
              Limpiar
            </button>
            <button type="button" class="btn btn-info" (click)="previewResults()">
              <i class="fas fa-eye"></i>
              Vista previa ({{ previewCount }})
            </button>
            <button type="button" class="btn btn-primary" (click)="search()">
              <i class="fas fa-search"></i>
              Buscar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .advanced-search {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .search-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
    }

    .search-header h3 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.3rem;
    }

    .toggle-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: background 0.2s ease;
    }

    .toggle-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .search-content {
      padding: 2rem;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .search-section {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #e9ecef;
    }

    .search-section:last-of-type {
      border-bottom: none;
      margin-bottom: 0;
    }

    .search-section h4 {
      margin: 0 0 1.5rem 0;
      color: #495057;
      font-size: 1.1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .search-section h4::before {
      content: '';
      width: 4px;
      height: 20px;
      background: #007bff;
      border-radius: 2px;
    }

    .search-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      align-items: end;
    }

    .search-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .search-field.full-width {
      grid-column: 1 / -1;
    }

    .search-field label {
      font-weight: 600;
      color: #495057;
      font-size: 0.9rem;
    }

    .form-control {
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    .form-control:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
      outline: none;
    }

    .search-input-group {
      position: relative;
      display: flex;
    }

    .search-input-group input {
      flex: 1;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-right: none;
    }

    .search-suggestion-btn {
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-left: none;
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
      padding: 0.75rem;
      cursor: pointer;
      color: #6c757d;
      transition: all 0.2s ease;
    }

    .search-suggestion-btn:hover {
      background: #e9ecef;
      color: #495057;
    }

    .search-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      margin-top: 0.5rem;
    }

    .suggestion-item {
      padding: 1rem;
      cursor: pointer;
      border-bottom: 1px solid #f8f9fa;
      transition: background 0.2s ease;
    }

    .suggestion-item:hover {
      background: #f8f9fa;
    }

    .suggestion-item:last-child {
      border-bottom: none;
    }

    .suggestion-item strong {
      color: #007bff;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .checkbox-item input[type="checkbox"] {
      width: 20px;
      height: 20px;
      accent-color: #007bff;
    }

    .checkbox-item label {
      margin: 0;
      cursor: pointer;
    }

    .search-actions {
      background: #f8f9fa;
      padding: 1.5rem;
      margin: 0 -2rem -2rem -2rem;
      border-top: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .saved-searches {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .saved-searches select {
      min-width: 200px;
    }

    .action-buttons {
      display: flex;
      gap: 0.75rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background: #0056b3;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }

    .btn-info {
      background: #17a2b8;
      color: white;
    }

    .btn-info:hover {
      background: #117a8b;
    }

    .btn-outline {
      background: white;
      color: #007bff;
      border: 2px solid #007bff;
    }

    .btn-outline:hover {
      background: #007bff;
      color: white;
    }

    @media (max-width: 768px) {
      .search-content {
        padding: 1rem;
      }

      .search-row {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .search-actions {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .saved-searches {
        flex-direction: column;
        align-items: stretch;
      }

      .action-buttons {
        justify-content: center;
        flex-wrap: wrap;
      }
    }
  `]
})
export class AuditAdvancedSearchComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<AdvancedSearchFilters>();
  @Output() searchTriggered = new EventEmitter<AdvancedSearchFilters>();

  isExpanded = false;
  showSearchSuggestions = false;
  previewCount = 0;

  filters: AdvancedSearchFilters = {
    searchTerm: '',
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
    centroId: '',
    especialidadId: '',
    staffMedicoId: '',
    pacienteId: '',
    tipoAuditoria: '',
    severidad: '',
    conConflictos: false,
    soloValidados: false,
    incluirCancelados: false
  };

  centros: any[] = [];
  especialidades: any[] = [];
  medicos: any[] = [];
  savedSearches: any[] = [
    { id: 1, name: 'Turnos con conflictos esta semana' },
    { id: 2, name: 'Validaciones pendientes' },
    { id: 3, name: 'Auditorías críticas' }
  ];

  constructor(private dropdownService: AuditDropdownService) {}

  ngOnInit(): void {
    this.loadDropdownData();
  }

  loadDropdownData(): void {
    this.dropdownService.getAllDropdownData().subscribe({
      next: (data) => {
        this.centros = data.centros;
        this.especialidades = data.especialidades;
        this.medicos = data.medicos;
      },
      error: (error) => {
        console.error('Error loading dropdown data:', error);
      }
    });
  }

  toggle(): void {
    this.isExpanded = !this.isExpanded;
  }

  applySuggestion(suggestion: string): void {
    this.filters.searchTerm = suggestion;
    this.showSearchSuggestions = false;
  }

  applyQuickDateRange(event: any): void {
    const range = event.target.value;
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    switch (range) {
      case 'today':
        this.filters.fechaDesde = formatDate(today);
        this.filters.fechaHasta = formatDate(today);
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        this.filters.fechaDesde = formatDate(yesterday);
        this.filters.fechaHasta = formatDate(yesterday);
        break;
      case 'this_week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        this.filters.fechaDesde = formatDate(weekStart);
        this.filters.fechaHasta = formatDate(today);
        break;
      case 'last_week':
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
        this.filters.fechaDesde = formatDate(lastWeekStart);
        this.filters.fechaHasta = formatDate(lastWeekEnd);
        break;
      case 'this_month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        this.filters.fechaDesde = formatDate(monthStart);
        this.filters.fechaHasta = formatDate(today);
        break;
      case 'last_month':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        this.filters.fechaDesde = formatDate(lastMonthStart);
        this.filters.fechaHasta = formatDate(lastMonthEnd);
        break;
      case 'last_3_months':
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        this.filters.fechaDesde = formatDate(threeMonthsAgo);
        this.filters.fechaHasta = formatDate(today);
        break;
    }
    
    // Reset the select
    event.target.value = '';
  }

  clearFilters(): void {
    this.filters = {
      searchTerm: '',
      estado: '',
      fechaDesde: '',
      fechaHasta: '',
      centroId: '',
      especialidadId: '',
      staffMedicoId: '',
      pacienteId: '',
      tipoAuditoria: '',
      severidad: '',
      conConflictos: false,
      soloValidados: false,
      incluirCancelados: false
    };
    this.filtersChanged.emit(this.filters);
  }

  previewResults(): void {
    // Simulate preview count
    this.previewCount = Math.floor(Math.random() * 500) + 50;
  }

  search(): void {
    this.searchTriggered.emit(this.filters);
  }

  saveCurrentSearch(): void {
    const name = prompt('Nombre para la búsqueda guardada:');
    if (name) {
      const newSearch = {
        id: this.savedSearches.length + 1,
        name: name,
        filters: { ...this.filters }
      };
      this.savedSearches.push(newSearch);
    }
  }

  loadSavedSearch(event: any): void {
    const searchId = parseInt(event.target.value);
    if (searchId) {
      // In a real app, this would load the saved filters
      // For now, we'll apply some sample filters based on the search
      switch (searchId) {
        case 1:
          this.filters.conConflictos = true;
          this.applyQuickDateRange({ target: { value: 'this_week' } });
          break;
        case 2:
          this.filters.soloValidados = false;
          this.filters.tipoAuditoria = 'MANUAL';
          break;
        case 3:
          this.filters.severidad = 'critical';
          break;
      }
      this.filtersChanged.emit(this.filters);
    }
    // Reset the select
    event.target.value = '';
  }
}
