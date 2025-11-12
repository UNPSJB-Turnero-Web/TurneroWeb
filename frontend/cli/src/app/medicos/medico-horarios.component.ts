import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { DisponibilidadMedicoService } from '../disponibilidadMedicos/disponibilidadMedico.service';
import { DisponibilidadMedico } from '../disponibilidadMedicos/disponibilidadMedico';
import { MedicoService } from './medico.service';
import { Medico } from './medico';
import { Especialidad } from '../especialidades/especialidad';
import { StaffMedicoService } from '../staffMedicos/staffMedico.service';

@Component({
  selector: 'app-medico-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medico-horarios.component.html', 
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ height: '0', opacity: '0', overflow: 'hidden' }),
        animate('300ms ease-in-out', style({ height: '*', opacity: '1' }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: '1', overflow: 'hidden' }),
        animate('300ms ease-in-out', style({ height: '0', opacity: '0' }))
      ])
    ])
  ],
  styleUrl: './medico-horarios.component.css'
})
export class MedicoHorariosComponent implements OnInit {
  disponibilidades: DisponibilidadMedico[] = []; // Disponibilidades del centro actual
  todasLasDisponibilidades: DisponibilidadMedico[] = []; // TODAS las disponibilidades del médico (para validación intercentros)
  disponibilidadesCacheadas = false; // Flag para saber si ya se cargaron todas las disponibilidades
  mostrarFormulario = false;
  modoEdicion = false;
  disponibilidadEditando: DisponibilidadMedico | null = null;
  cargando = false;
  guardando = false;

  // Estados de carga específicos
  cargandoCentros = false;
  
  // Control de mensaje informativo
  mostrarMensajeMultiCentro = false;
  cargandoDisponibilidades = false;
  cambiandoCentro = false;
  errorCarga: string | null = null;

  // Nuevas propiedades para especialidades
  medicoActual: Medico | null = null;
  especialidades: Especialidad[] = [];
  especialidadSeleccionada: number | null = null;
  disponibilidadesPorEspecialidad: { [especialidadId: number]: DisponibilidadMedico[] } = {};

  // Nuevas propiedades para múltiples centros de atención
  staffMedicos: any[] = []; // Lista de todos los StaffMedico del médico actual
  staffMedicoSeleccionado: any | null = null; // StaffMedico actual (centro + especialidad específicos)
  centroActual: any | null = null; // Centro de atención actual

  horariosForm: { dia: string, horaInicio: string, horaFin: string }[] = [];

  // Particles for background animation
  particles: Array<{x: number, y: number}> = [];

  diasSemana = [
    { nombre: 'Lunes', valor: 'LUNES' },
    { nombre: 'Martes', valor: 'MARTES' },
    { nombre: 'Miércoles', valor: 'MIERCOLES' },
    { nombre: 'Jueves', valor: 'JUEVES' },
    { nombre: 'Viernes', valor: 'VIERNES' },
    { nombre: 'Sábado', valor: 'SABADO' },
    { nombre: 'Domingo', valor: 'DOMINGO' }
  ];

  constructor(
    private router: Router,
    private disponibilidadService: DisponibilidadMedicoService,
    private medicoService: MedicoService,
    private staffMedicoService: StaffMedicoService,
  ) {
    this.initializeParticles();
  }

  // Helper method to get medico ID from localStorage
  private getMedicoIdFromLocalStorage(): number | null {
    console.log('=== DEBUG: getMedicoIdFromLocalStorage ===');
    
    // Try to get medico ID from different possible localStorage keys
    const staffMedicoId = localStorage.getItem('staffMedicoId');
    const medicoId = localStorage.getItem('medicoId');
    const currentUser = localStorage.getItem('currentUser');
    
    console.log('LocalStorage values:', {
      staffMedicoId,
      medicoId,
      currentUser: currentUser ? 'exists' : 'null'
    });
    
    // ⚠️ IMPORTANTE: PRIMERO intentar con medicoId, NO con staffMedicoId
    // El staffMedicoId es diferente al medicoId y causa problemas de autenticación
    
    // First try medicoId (este es el ID correcto del médico)
    if (medicoId && medicoId !== '0' && medicoId !== 'null' && medicoId !== 'undefined') {
      const id = parseInt(medicoId, 10);
      if (!isNaN(id) && id > 0) {
        console.log('✅ Using medicoId:', id);
        return id;
      }
    }
    
    // Finally try currentUser
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        console.log('Parsed currentUser:', user);
        
        if (user.medicoId && user.medicoId !== 0) {
          console.log('Using currentUser.medicoId:', user.medicoId);
          return user.medicoId;
        }
        if (user.id && user.id !== 0) {
          console.log('Using currentUser.id:', user.id);
          return user.id;
        }
      } catch (e) {
        console.error('Error parsing currentUser from localStorage:', e);
      }
    }
    
    console.error('No valid medico ID found in localStorage');
    return null;
  }

  // Helper method to get or fetch staffMedicoId and store it in localStorage
  private getOrFetchStaffMedicoId(): Promise<number | null> {
    return new Promise((resolve) => {
      // First try to get staffMedicoId from localStorage
      const staffMedicoIdStr = localStorage.getItem('staffMedicoId');
      
      if (staffMedicoIdStr && staffMedicoIdStr !== 'null' && staffMedicoIdStr !== '0') {
        const staffMedicoId = parseInt(staffMedicoIdStr, 10);
        if (!isNaN(staffMedicoId) && staffMedicoId > 0) {
          console.log('✅ Found staffMedicoId in localStorage:', staffMedicoId);
          resolve(staffMedicoId);
          return;
        }
      }

      // If not in localStorage, fetch by medicoId
      const medicoId = this.getMedicoIdFromLocalStorage();
      if (!medicoId) {
        console.error('❌ No medicoId found to search for staffMedicoId');
        resolve(null);
        return;
      }

      console.log('🔍 Searching for StaffMedico by medicoId:', medicoId);
      
      this.staffMedicoService.all().subscribe({
        next: (response: any) => {
          const staffMedicos = response?.data || [];
          
          // Find all StaffMedicos that belong to this doctor
          const staffMedicosDelMedico = staffMedicos.filter((sm: any) => 
            sm.medico && sm.medico.id === medicoId
          );
          
          if (staffMedicosDelMedico.length > 0) {
            const staffMedicoId = staffMedicosDelMedico[0].id;
            console.log(`✅ Found ${staffMedicosDelMedico.length} StaffMedico records for doctor. Using first one:`, staffMedicoId);
            
            // Store in localStorage for future use
            localStorage.setItem('staffMedicoId', staffMedicoId.toString());
            resolve(staffMedicoId);
          } else {
            console.error('❌ No StaffMedico records found for medicoId:', medicoId);
            resolve(null);
          }
        },
        error: (error: any) => {
          console.error('❌ Error fetching StaffMedicos:', error);
          resolve(null);
        }
      });
    });
  }

  ngOnInit() {
    console.log('=== INICIANDO COMPONENTE MEDICO-HORARIOS ===');
    this.verificarConfiguracionSesion();
    
    // Validar y corregir localStorage
    this.validarYCorregirLocalStorage();
    
    // Pequeña pausa para que se vean los logs antes de continuar
    setTimeout(() => {
      this.cargarMedicoYEspecialidades();
    }, 100);
  }

  // Método para reintentar la carga cuando hay errores
  reintentar() {
    console.log('Reintentando carga de datos...');
    this.errorCarga = null;
    this.cargando = true;
    this.cargandoCentros = false;
    this.cambiandoCentro = false;
    
    // Reiniciar el proceso de carga
    this.cargarMedicoYEspecialidades();
  }

  /**
   * Valida y corrige problemas comunes en localStorage
   */
  private validarYCorregirLocalStorage() {
    console.log('🔍 Validando localStorage en componente de horarios...');
    
    const medicoId = localStorage.getItem('medicoId');
    const staffMedicoId = localStorage.getItem('staffMedicoId');
    const currentUser = localStorage.getItem('currentUser');
    
    console.log('📋 Estado actual del localStorage:', {
      medicoId,
      staffMedicoId,
      currentUser: currentUser ? 'exists' : 'null'
    });
    
    // Verificar si tenemos los IDs correctos
    if (!medicoId || medicoId === '0' || medicoId === 'null') {
      console.warn('⚠️ medicoId faltante o inválido en componente de horarios');
      
      // Intentar recuperar desde currentUser
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser);
          if (user.medicoId && user.medicoId !== 0) {
            console.log('🔧 Corrigiendo medicoId desde currentUser:', user.medicoId);
            localStorage.setItem('medicoId', user.medicoId.toString());
          } else if (user.id && user.id !== 0 && user.id !== parseInt(staffMedicoId || '0', 10)) {
            console.log('🔧 Usando user.id como medicoId:', user.id);
            localStorage.setItem('medicoId', user.id.toString());
          }
        } catch (e) {
          console.error('Error parseando currentUser:', e);
        }
      }
    }
    
    // Verificar que medicoId y staffMedicoId no sean el mismo (común error)
    const finalMedicoId = localStorage.getItem('medicoId');
    const finalStaffMedicoId = localStorage.getItem('staffMedicoId');
    
    if (finalMedicoId === finalStaffMedicoId && finalMedicoId && finalMedicoId !== '0') {
      console.warn('🚨 PROBLEMA en horarios: medicoId y staffMedicoId son iguales!', {
        medicoId: finalMedicoId,
        staffMedicoId: finalStaffMedicoId
      });
    }
    
    console.log('✅ Validación de localStorage completada en horarios');
  }

  verificarConfiguracionSesion() {
    console.log('=== VERIFICACIÓN DE SESIÓN DETALLADA ===');
    console.log('Todas las claves en localStorage:', Object.keys(localStorage));
    
    // Verificar cada key individualmente
    const keys = ['currentUser', 'staffMedicoId', 'userId', 'medicoId', 'id'];
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`${key}:`, value);
      
      if (key === 'currentUser' && value) {
        try {
          const parsed = JSON.parse(value);
          console.log(`${key} parsed:`, parsed);
        } catch (e) {
          console.error(`Error parsing ${key}:`, e);
        }
      }
    });
    
    // Verificar el resultado del getMedicoIdFromLocalStorage
    const medicoId = this.getMedicoIdFromLocalStorage();
    console.log('ID final detectado por getMedicoIdFromLocalStorage():', medicoId);
    
    console.log('=== FIN VERIFICACIÓN DETALLADA ===');
  }

  cargarMedicoYEspecialidades() {
    // Para cargar el médico usamos el ID del localStorage
    const medicoId = this.getMedicoIdFromLocalStorage();

    if (!medicoId) {
      console.error('Error: No se pudo obtener el ID del médico');
      this.router.navigate(['/login']);
      return;
    }

    console.log('Intentando cargar médico con ID:', medicoId);

    // Cargar información del médico y sus especialidades
    this.medicoService.findById(medicoId).subscribe({
      next: (medico) => {
        console.log('Médico encontrado exitosamente:', medico);
        this.medicoActual = medico;
        this.especialidades = medico.especialidades || [];
        console.log('Especialidades cargadas:', this.especialidades);
        
        // Cargar todos los StaffMedicos del médico
        this.cargarStaffMedicos(medicoId);
      },
      error: (error) => {
        console.error('Error al cargar médico:', error);
        console.error('Error completo:', JSON.stringify(error, null, 2));
        console.error('Medico ID usado:', medicoId);
        
        if (error.status === 404) {
          console.error(`⚠️ Médico con ID ${medicoId} no encontrado en el servidor`);
          
          alert(`Error: No se encontró el médico con ID ${medicoId}. 
          
Posible problema de configuración. Verifique:
- LocalStorage medicoId: ${localStorage.getItem('medicoId')}
- LocalStorage staffMedicoId: ${localStorage.getItem('staffMedicoId')}

¿Desea continuar o ir al login?`);
          
          // Solo limpiar localStorage si el usuario lo confirma
          const shouldLogout = confirm('¿Desea cerrar sesión e ir al login?');
          if (shouldLogout) {
            localStorage.clear();
            this.router.navigate(['/login']);
          }
        } else {
          alert(`Error al cargar información del médico: ${error.error?.message || error.message}`);
        }
      }
    });
  }

  // Nuevo método para cargar todos los StaffMedicos del médico
  cargarStaffMedicos(medicoId: number) {
    console.log('Cargando StaffMedicos para médico:', medicoId);
    this.cargandoCentros = true;
    this.errorCarga = null;
    
    this.staffMedicoService.getByMedicoId(medicoId).subscribe({
      next: (response) => {
        this.staffMedicos = response.data || [];
        console.log('StaffMedicos cargados - Cantidad:', this.staffMedicos.length);
        console.log('StaffMedicos cargados - Detalle:', this.staffMedicos);
        
        // Log específico de los centros de atención
        this.staffMedicos.forEach((staff, index) => {
          console.log(`Staff ${index}:`, {
            id: staff.id,
            centroAtencion: staff.centroAtencion,
            especialidad: staff.especialidad,
            tienecentro: !!staff.centroAtencion,
            nombrecentro: staff.centroAtencion?.nombre || 'SIN NOMBRE'
          });
        });
        
        // Seleccionar el StaffMedico actual basado en localStorage
        this.seleccionarStaffMedicoActual();
        
        this.cargandoCentros = false;
        
        // Solo cargar disponibilidades después de tener el contexto de StaffMedico
        this.cargarDisponibilidades();
      },
      error: (error) => {
        console.error('Error al cargar StaffMedicos:', error);
        this.cargandoCentros = false;
        this.errorCarga = 'Error al cargar información de centros de atención. Por favor, intente nuevamente.';
        
        // Continuar con la lógica anterior si falla
        this.cargarDisponibilidades();
      }
    });
  }

  // Método para seleccionar el StaffMedico actual
  seleccionarStaffMedicoActual() {
    const staffMedicoIdStr = localStorage.getItem('staffMedicoId');
    
    if (staffMedicoIdStr && this.staffMedicos.length > 0) {
      const staffMedicoId = parseInt(staffMedicoIdStr, 10);
      
      // Buscar el StaffMedico específico
      this.staffMedicoSeleccionado = this.staffMedicos.find(sm => sm.id === staffMedicoId);
      
      if (this.staffMedicoSeleccionado) {
        console.log('StaffMedico seleccionado:', this.staffMedicoSeleccionado);
        this.centroActual = this.staffMedicoSeleccionado.centroAtencion;
        this.especialidadSeleccionada = this.staffMedicoSeleccionado.especialidad?.id;
      } else {
        console.warn('No se encontró StaffMedico con ID:', staffMedicoId);
        // Seleccionar el primer StaffMedico disponible
        this.staffMedicoSeleccionado = this.staffMedicos[0];
        this.centroActual = this.staffMedicoSeleccionado?.centroAtencion;
        this.especialidadSeleccionada = this.staffMedicoSeleccionado?.especialidad?.id;
        
        // Actualizar localStorage
        if (this.staffMedicoSeleccionado) {
          localStorage.setItem('staffMedicoId', this.staffMedicoSeleccionado.id.toString());
        }
      }
    } else if (this.staffMedicos.length > 0) {
      // Si no hay staffMedicoId en localStorage, seleccionar el primero
      this.staffMedicoSeleccionado = this.staffMedicos[0];
      this.centroActual = this.staffMedicoSeleccionado?.centroAtencion;
      this.especialidadSeleccionada = this.staffMedicoSeleccionado?.especialidad?.id;
      
      // Guardar en localStorage
      localStorage.setItem('staffMedicoId', this.staffMedicoSeleccionado.id.toString());
    }
    
    console.log('Contexto actual:', {
      staffMedico: this.staffMedicoSeleccionado,
      centro: this.centroActual,
      especialidad: this.especialidadSeleccionada
    });
  }

  // Método para cambiar el StaffMedico activo
  cambiarStaffMedico(nuevoStaffMedico: any) {
    console.log('Cambiando a StaffMedico:', nuevoStaffMedico);
    
    // Mostrar estado de carga durante el cambio
    this.cambiandoCentro = true;
    this.errorCarga = null;
    
    // Pequeño delay para mostrar el estado de carga
    setTimeout(() => {
      this.staffMedicoSeleccionado = nuevoStaffMedico;
      this.centroActual = nuevoStaffMedico?.centroAtencion;
      this.especialidadSeleccionada = nuevoStaffMedico?.especialidad?.id;
      
      // Actualizar localStorage
      localStorage.setItem('staffMedicoId', nuevoStaffMedico.id.toString());
      
      // Si tenemos las disponibilidades cacheadas, solo filtrar sin recargar
      if (this.disponibilidadesCacheadas) {
        console.log('Usando cache - filtrando disponibilidades para el nuevo centro...');
        this.filtrarDisponibilidadesPorCentroActual();
      } else {
        console.log('Sin cache - recargando disponibilidades desde servidor...');
        this.cargarDisponibilidades();
      }
      
      console.log('Nuevo contexto:', {
        staffMedico: this.staffMedicoSeleccionado,
        centro: this.centroActual,
        especialidad: this.especialidadSeleccionada
      });
      
      // Finalizar estado de cambio
      setTimeout(() => {
        this.cambiandoCentro = false;
      }, 300);
    }, 200);
  }

  getHorariosPorEspecialidad(especialidadId: number): DisponibilidadMedico[] {
    return this.disponibilidadesPorEspecialidad[especialidadId] || [];
  }

  // Método para contar disponibilidades por StaffMedico
  getDisponibilidadesPorStaff(staffMedicoId: number): number {
    return this.todasLasDisponibilidades.filter(disp => disp.staffMedicoId === staffMedicoId).length;
  }



  // Obtener todas las especialidades del médico en el centro actual

  // Obtener el nombre del centro actual de forma segura
  getNombreCentroActual(): string {
    // Primero intentar desde centroActual
    if (this.centroActual?.nombre) {
      return this.centroActual.nombre;
    }
    
    // Luego intentar desde staffMedicoSeleccionado
    if (this.staffMedicoSeleccionado?.centroAtencion?.nombre) {
      return this.staffMedicoSeleccionado.centroAtencion.nombre;
    }
    
    // Si staffMedicoSeleccionado tiene un ID, buscar en el array de staffMedicos
    if (this.staffMedicoSeleccionado?.id && this.staffMedicos?.length > 0) {
      const staffActual = this.staffMedicos.find(sm => sm.id === this.staffMedicoSeleccionado!.id);
      if (staffActual?.centroAtencion?.nombre) {
        return staffActual.centroAtencion.nombre;
      }
    }
    
    // Como fallback, usar el primer staffMedico si existe
    if (this.staffMedicos?.length > 0 && this.staffMedicos[0]?.centroAtencion?.nombre) {
      return this.staffMedicos[0].centroAtencion.nombre;
    }
    
    return 'Centro no disponible';
  }

  // Obtener todas las especialidades del médico en el centro actual
  getEspecialidadesEnCentroActual(): string[] {
    if (!this.staffMedicoSeleccionado || !this.staffMedicos) {
      return [];
    }
    
    const centroId = this.staffMedicoSeleccionado.centroAtencion?.id;
    if (!centroId) return [];
    
    // Filtrar todos los StaffMedicos del mismo centro y devolver solo nombres de especialidades
    return this.staffMedicos
      .filter(sm => sm.centroAtencion?.id === centroId)
      .map(sm => sm.especialidad?.nombre)
      .filter(nombre => nombre); // Filtrar nombres nulos/undefined
  }

  // Obtener solo las especialidades que el médico tiene en el centro actual
  getEspecialidadesDelCentroActual(): Especialidad[] {
    if (!this.staffMedicoSeleccionado || !this.staffMedicos) {
      return [];
    }
    
    const centroId = this.staffMedicoSeleccionado.centroAtencion?.id;
    if (!centroId) return [];
    
    // Filtrar StaffMedicos del mismo centro y extraer las especialidades únicas
    const especialidadesDelCentro: Especialidad[] = [];
    const especialidadesIds = new Set<number>();
    
    this.staffMedicos
      .filter(sm => sm.centroAtencion?.id === centroId)
      .forEach(sm => {
        if (sm.especialidad && sm.especialidad.id && !especialidadesIds.has(sm.especialidad.id)) {
          especialidadesIds.add(sm.especialidad.id);
          especialidadesDelCentro.push(sm.especialidad);
        }
      });
    
    return especialidadesDelCentro;
  }

  // Método para obtener otros centros disponibles (excluyendo el actual)
  getOtrosCentros(): any[] {
    if (!this.staffMedicoSeleccionado) {
      return this.staffMedicos;
    }
    return this.staffMedicos.filter(staff => staff.id !== this.staffMedicoSeleccionado.id);
  }

  // Método para obtener el total de centros únicos disponibles
  getTotalCentrosDisponibles(): number {
    if (!this.staffMedicos || this.staffMedicos.length === 0) {
      return 0;
    }
    // Contar centros únicos por nombre
    const centrosUnicos = new Set(
      this.staffMedicos
        .map(staff => staff.centroAtencion?.nombre)
        .filter(nombre => nombre) // filtrar nulls/undefined
    );
    return centrosUnicos.size;
  }

  // Método para obtener centros únicos (sin repetir el actual)
  getCentrosUnicos(): any[] {
    if (!this.staffMedicos || this.staffMedicos.length === 0) {
      return [];
    }

    const centroActualNombre = this.staffMedicoSeleccionado?.centroAtencion?.nombre;
    const centrosMap = new Map();

    // Agrupar por nombre de centro, excluyendo el actual
    this.staffMedicos.forEach(staff => {
      const nombreCentro = staff.centroAtencion?.nombre;
      if (nombreCentro && nombreCentro !== centroActualNombre) {
        if (!centrosMap.has(nombreCentro)) {
          centrosMap.set(nombreCentro, {
            nombre: nombreCentro,
            staffMedicos: []
          });
        }
        centrosMap.get(nombreCentro).staffMedicos.push(staff);
      }
    });

    return Array.from(centrosMap.values());
  }

  // Método para cambiar a un centro específico (selecciona el primer StaffMedico de ese centro)
  cambiarACentro(nombreCentro: string): void {
    const staffDelCentro = this.staffMedicos.find(staff => 
      staff.centroAtencion?.nombre === nombreCentro
    );
    
    if (staffDelCentro) {
      this.cambiarStaffMedico(staffDelCentro);
    }
  }

  // Método para manejar el evento de cambio de centro
  onCambiarCentro(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const nombreCentro = target.value;
    
    if (nombreCentro) {
      this.cambiarACentro(nombreCentro);
    }
  }

  cargarDisponibilidades() {
    // Si ya tenemos las disponibilidades cacheadas, solo filtrar por centro actual
    if (this.disponibilidadesCacheadas && this.todasLasDisponibilidades.length >= 0) {
      console.log('Usando disponibilidades cacheadas, filtrando por centro actual...');
      this.filtrarDisponibilidadesPorCentroActual();
      return;
    }

    this.cargandoDisponibilidades = true;
    const medicoId = this.getMedicoIdFromLocalStorage();

    // Validar que tenemos un ID válido
    if (!medicoId) {
      console.error('Error: No se pudo obtener el ID del médico para cargar disponibilidades');
      this.cargandoDisponibilidades = false;
      this.router.navigate(['/login']);
      return;
    }

    console.log('Cargando disponibilidades para médico ID:', medicoId);
    console.log('Contexto StaffMedico actual:', this.staffMedicoSeleccionado);

    this.disponibilidadService.byMedico(medicoId).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor (cargar):', response);
        const todasLasDisponibilidades = response.data || [];
        
        // Guardar TODAS las disponibilidades para validación intercentros
        this.todasLasDisponibilidades = todasLasDisponibilidades;
        this.disponibilidadesCacheadas = true;
        console.log('Todas las disponibilidades del médico:', this.todasLasDisponibilidades);
        
        // Filtrar disponibilidades por el StaffMedico actual para mostrar en UI
        this.filtrarDisponibilidadesPorCentroActual();
        
        this.cargandoDisponibilidades = false;
      },
      error: (error) => {
        console.error('Error al cargar disponibilidades:', error);
        this.cargandoDisponibilidades = false;
        if (error.status === 404) {
          console.log('No se encontraron disponibilidades para el médico (normal para primera vez)');
          this.disponibilidades = [];
          this.todasLasDisponibilidades = [];
          this.disponibilidadesCacheadas = true;
          this.organizarDisponibilidadesPorEspecialidad();
        } else if (error.status === 403) {
          this.errorCarga = 'Error de permisos. Verifique que su sesión sea válida.';
        } else {
          console.warn('Error al cargar disponibilidades:', error.message || error);
          this.disponibilidades = [];
          this.todasLasDisponibilidades = [];
          this.disponibilidadesCacheadas = true;
          this.organizarDisponibilidadesPorEspecialidad();
        }
      }
    });
  }

  // Nuevo método para filtrar disponibilidades sin recargar desde servidor
  private filtrarDisponibilidadesPorCentroActual() {
    if (this.staffMedicoSeleccionado) {
      this.disponibilidades = this.todasLasDisponibilidades.filter(disp => 
        disp.staffMedicoId === this.staffMedicoSeleccionado.id
      );
      console.log('Disponibilidades filtradas para StaffMedico', this.staffMedicoSeleccionado.id, ':', this.disponibilidades);
    } else {
      // Si no hay StaffMedico seleccionado, mostrar todas
      this.disponibilidades = this.todasLasDisponibilidades;
      console.log('Mostrando todas las disponibilidades:', this.disponibilidades);
    }
    
    this.organizarDisponibilidadesPorEspecialidad();
  }

  // Método para invalidar cache cuando hay cambios en disponibilidades
  private invalidarCacheDisponibilidades() {
    console.log('Cache invalidado - se requerirá recarga desde servidor');
    this.disponibilidadesCacheadas = false;
    this.todasLasDisponibilidades = [];
  }

  // Método para mostrar/ocultar mensaje informativo sobre navegación multi-centro
  toggleMensajeMultiCentro() {
    this.mostrarMensajeMultiCentro = !this.mostrarMensajeMultiCentro;
  }

  // Validaciones para casos edge
  validarCasosEdge(): string[] {
    const problemas: string[] = [];
    
    // Caso 1: Médico sin centros asignados
    if (!this.staffMedicos || this.staffMedicos.length === 0) {
      problemas.push('El médico no tiene centros de atención asignados. Contacte al administrador.');
    }
    
    // Caso 2: Centro sin especialidades
    if (this.staffMedicoSeleccionado && this.getEspecialidadesDelCentroActual().length === 0) {
      problemas.push(`El centro "${this.getNombreCentroActual()}" no tiene especialidades asignadas. Contacte al administrador.`);
    }
    
    // Caso 3: Datos inconsistentes en localStorage
    const staffIdEnStorage = localStorage.getItem('staffMedicoId');
    const centroEnStorage = localStorage.getItem('centroSeleccionado');
    
    if (staffIdEnStorage && this.staffMedicoSeleccionado && 
        this.staffMedicoSeleccionado.id.toString() !== staffIdEnStorage) {
      console.warn('Inconsistencia detectada en localStorage - limpiando...');
      localStorage.removeItem('staffMedicoId');
      localStorage.removeItem('centroSeleccionado');
    }
    
    if (centroEnStorage && this.staffMedicoSeleccionado && 
        this.staffMedicoSeleccionado.centroAtencion !== centroEnStorage) {
      console.warn('Centro en localStorage no coincide con selección actual - actualizando...');
      localStorage.setItem('centroSeleccionado', this.staffMedicoSeleccionado.centroAtencion);
    }
    
    return problemas;
  }

  // Método para manejar cambios rápidos de centro (debounce)
  private cambioRapidoTimer: any;
  
  private manejarCambioRapido(callback: () => void) {
    // Limpiar timer anterior si existe
    if (this.cambioRapidoTimer) {
      clearTimeout(this.cambioRapidoTimer);
    }
    
    // Establecer nuevo timer
    this.cambioRapidoTimer = setTimeout(() => {
      callback();
      this.cambioRapidoTimer = null;
    }, 300); // 300ms de debounce
  }

  organizarDisponibilidadesPorEspecialidad() {
    this.disponibilidadesPorEspecialidad = {};
    
    // Separar disponibilidades con y sin especialidad
    const disponibilidadesSinEspecialidad: DisponibilidadMedico[] = [];
    
    // Organizar disponibilidades existentes por especialidad
    this.disponibilidades.forEach(disponibilidad => {
      const especialidadId = disponibilidad.especialidadId;
      if (especialidadId) {
        if (!this.disponibilidadesPorEspecialidad[especialidadId]) {
          this.disponibilidadesPorEspecialidad[especialidadId] = [];
        }
        this.disponibilidadesPorEspecialidad[especialidadId].push(disponibilidad);
      } else {
        // Disponibilidades del sistema anterior sin especialidad
        disponibilidadesSinEspecialidad.push(disponibilidad);
        console.warn('Disponibilidad sin especialidad encontrada:', disponibilidad);
      }
    });

    // Si hay disponibilidades sin especialidad y tenemos especialidades disponibles,
    // mostrar un mensaje informativo
    if (disponibilidadesSinEspecialidad.length > 0 && this.especialidades.length > 0) {
      console.log(`Se encontraron ${disponibilidadesSinEspecialidad.length} disponibilidades del sistema anterior sin especialidad asociada.`);
      
      // Para mantener compatibilidad, asignar a la primera especialidad si es posible
      // Esto es temporal hasta que el usuario las migre manualmente
      const primeraEspecialidad = this.especialidades[0];
      if (primeraEspecialidad) {
        console.log(`Asignando temporalmente a la especialidad: ${primeraEspecialidad.nombre}`);
        disponibilidadesSinEspecialidad.forEach(disp => {
          disp.especialidadId = primeraEspecialidad.id;
          disp.especialidad = primeraEspecialidad;
        });
        
        if (!this.disponibilidadesPorEspecialidad[primeraEspecialidad.id]) {
          this.disponibilidadesPorEspecialidad[primeraEspecialidad.id] = [];
        }
        this.disponibilidadesPorEspecialidad[primeraEspecialidad.id].push(...disponibilidadesSinEspecialidad);
      }
    }

    console.log('Disponibilidades organizadas por especialidad:', this.disponibilidadesPorEspecialidad);
  }

  // Método para validar conflictos de horarios entre especialidades
  validarConflictosHorarios(nuevosHorarios: { dia: string, horaInicio: string, horaFin: string }[], especialidadIdExcluir?: number): string[] {
    const conflictos: string[] = [];
    
    // NUEVA VALIDACIÓN: Verificar superposiciones dentro de los mismos horarios que se están configurando
    const conflictosInternos = this.validarSuperposicionesInternas(nuevosHorarios);
    if (conflictosInternos.length > 0) {
      conflictos.push('CONFLICTOS EN LA CONFIGURACIÓN ACTUAL:');
      conflictos.push(...conflictosInternos);
    }
    
    // Verificar conflictos con horarios existentes en el sistema
    const conflictosExternos = this.validarConflictosConHorariosExistentes(nuevosHorarios, especialidadIdExcluir);
    if (conflictosExternos.length > 0) {
      if (conflictos.length > 0) {
        conflictos.push(''); // Línea en blanco para separar
      }
      conflictos.push('CONFLICTOS CON HORARIOS EXISTENTES:');
      conflictos.push(...conflictosExternos);
    }
    
    return conflictos;
  }

  // NUEVA FUNCIÓN: Validar superposiciones dentro de los horarios que se están configurando
  private validarSuperposicionesInternas(horarios: { dia: string, horaInicio: string, horaFin: string }[]): string[] {
    const conflictos: string[] = [];
    
    // Agrupar horarios por día
    const horariosPorDia: { [dia: string]: { horaInicio: string, horaFin: string, indice: number }[] } = {};
    
    horarios.forEach((horario, indice) => {
      if (!horariosPorDia[horario.dia]) {
        horariosPorDia[horario.dia] = [];
      }
      horariosPorDia[horario.dia].push({
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin,
        indice: indice + 1 // Índice para mostrar al usuario (empezando en 1)
      });
    });
    
    // Verificar superposiciones dentro de cada día
    Object.keys(horariosPorDia).forEach(dia => {
      const horariosDelDia = horariosPorDia[dia];
      
      for (let i = 0; i < horariosDelDia.length; i++) {
        for (let j = i + 1; j < horariosDelDia.length; j++) {
          const horario1 = horariosDelDia[i];
          const horario2 = horariosDelDia[j];
          
          if (this.horariosSeSolapan(horario1, horario2)) {
            conflictos.push(`${dia}: Horario ${horario1.indice} (${horario1.horaInicio}-${horario1.horaFin}) se superpone con Horario ${horario2.indice} (${horario2.horaInicio}-${horario2.horaFin})`);
          }
        }
      }
    });
    
    return conflictos;
  }

  // Validar conflictos con horarios existentes en TODOS los centros (intercentros)
  private validarConflictosConHorariosExistentes(nuevosHorarios: { dia: string, horaInicio: string, horaFin: string }[], especialidadIdExcluir?: number): string[] {
    const conflictos: string[] = [];
    
    // Revisar cada nuevo horario contra TODAS las disponibilidades del médico
    nuevosHorarios.forEach(nuevoHorario => {
      // Recorrer todas las disponibilidades del médico (en todos los centros)
      this.todasLasDisponibilidades.forEach(disponibilidad => {
        
        // En modo edición, excluir la disponibilidad que estamos editando
        if (this.modoEdicion && this.disponibilidadEditando && 
            disponibilidad.id === this.disponibilidadEditando.id) {
          return;
        }
        
        // Revisar todos los horarios de esta disponibilidad
        disponibilidad.horarios.forEach((horarioExistente: any) => {
          if (horarioExistente.dia === nuevoHorario.dia) {
            // Verificar si hay solapamiento de horarios
            if (this.horariosSeSolapan(nuevoHorario, horarioExistente)) {
              
              // Buscar información del centro y especialidad del horario conflictivo
              const staffMedicoConflictivo = this.staffMedicos.find(sm => sm.id === disponibilidad.staffMedicoId);
              const centroConflictivo = staffMedicoConflictivo?.centroAtencion?.nombre || `Centro ID ${disponibilidad.staffMedicoId}`;
              const especialidadConflictiva = staffMedicoConflictivo?.especialidad?.nombre || `Especialidad ID ${disponibilidad.especialidadId}`;
              
              // Verificar si el conflicto es en el mismo centro o en otro centro
              const esMismoCentro = this.staffMedicoSeleccionado && 
                                   staffMedicoConflictivo?.centroAtencion?.id === this.staffMedicoSeleccionado.centroAtencion?.id;
              
              if (esMismoCentro) {
                conflictos.push(`${nuevoHorario.dia}: ${nuevoHorario.horaInicio}-${nuevoHorario.horaFin} se superpone con horario existente en ${especialidadConflictiva} (${horarioExistente.horaInicio}-${horarioExistente.horaFin})`);
              } else {
                // CONFLICTO INTERCENTROS - Más crítico
                conflictos.push(`⚠️ CONFLICTO INTERCENTROS - ${nuevoHorario.dia}: ${nuevoHorario.horaInicio}-${nuevoHorario.horaFin} se superpone con horario en "${centroConflictivo}" - ${especialidadConflictiva} (${horarioExistente.horaInicio}-${horarioExistente.horaFin})`);
              }
            }
          }
        });
      });
    });
    
    return conflictos;
  }

  // Método auxiliar para verificar si dos horarios se solapan
  private horariosSeSolapan(horario1: { horaInicio: string, horaFin: string }, horario2: { horaInicio: string, horaFin: string }): boolean {
    const inicio1 = this.convertirHoraAMinutos(horario1.horaInicio);
    const fin1 = this.convertirHoraAMinutos(horario1.horaFin);
    const inicio2 = this.convertirHoraAMinutos(horario2.horaInicio);
    const fin2 = this.convertirHoraAMinutos(horario2.horaFin);
    
    // Los horarios se solapan si uno empieza antes de que termine el otro
    return (inicio1 < fin2) && (inicio2 < fin1);
  }

  // Convertir hora en formato HH:MM a minutos desde medianoche
  private convertirHoraAMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  agregarHorario() {
    this.horariosForm.push({ dia: '', horaInicio: '08:00', horaFin: '17:00' });
  }

  eliminarHorario(index: number) {
    this.horariosForm.splice(index, 1);
  }

  aplicarPlantilla(tipo: string) {
    this.horariosForm.forEach(horario => {
      switch (tipo) {
        case 'manana':
          horario.horaInicio = '08:00';
          horario.horaFin = '13:00';
          break;
        case 'tarde':
          horario.horaInicio = '14:00';
          horario.horaFin = '19:00';
          break;
        case 'completo':
          horario.horaInicio = '08:00';
          horario.horaFin = '18:00';
          break;
      }
    });
  }

  async guardarDisponibilidad() {
    const horarios = this.horariosForm.filter(h => h.dia && h.horaInicio && h.horaFin);
    
    if (horarios.length === 0) {
      alert('Debe configurar al menos un horario');
      return;
    }

    // Validar que se haya seleccionado una especialidad
    if (!this.especialidadSeleccionada) {
      alert('Debe seleccionar una especialidad');
      return;
    }

    // Validar conflictos de horarios
    const especialidadExcluir = this.modoEdicion ? this.disponibilidadEditando?.especialidadId : undefined;
    const conflictos = this.validarConflictosHorarios(horarios, especialidadExcluir);
    
    if (conflictos.length > 0) {
      // Separar tipos de conflictos
      const tieneConflictosInternos = conflictos.some(c => c.includes('CONFLICTOS EN LA CONFIGURACIÓN ACTUAL:'));
      const tieneConflictosIntercentros = conflictos.some(c => c.includes('⚠️ CONFLICTO INTERCENTROS'));
      
      if (tieneConflictosInternos) {
        // Los conflictos internos (superposiciones en el mismo formulario) NUNCA se permiten
        alert('ERROR: No se puede guardar la configuración debido a superposiciones de horarios:\n\n' + conflictos.join('\n') + '\n\nPor favor, corrija los conflictos antes de continuar.');
        return;
      } else if (tieneConflictosIntercentros) {
        // Los conflictos intercentros son MUY críticos - el médico no puede estar en dos lugares a la vez
        const mensaje = '🚨 CONFLICTOS CRÍTICOS DETECTADOS 🚨\n\nUn médico no puede atender en múltiples centros al mismo tiempo:\n\n' + 
                       conflictos.join('\n') + 
                       '\n\n⚠️ ADVERTENCIA: Estos conflictos pueden causar problemas serios en la programación de turnos.\n\n¿Está SEGURO que desea continuar?';
        if (!confirm(mensaje)) {
          return;
        }
      } else {
        // Conflictos menores (dentro del mismo centro)
        const mensaje = 'Se encontraron conflictos de horarios en el mismo centro:\n\n' + conflictos.join('\n') + '\n\n¿Desea continuar de todas formas?';
        if (!confirm(mensaje)) {
          return;
        }
      }
    }

    this.guardando = true;

    if (this.modoEdicion && this.disponibilidadEditando) {
      // Al actualizar, usar el staffMedicoId de la disponibilidad existente
      const staffMedicoIdExistente = this.disponibilidadEditando.staffMedicoId;
      
      console.log('Modo edición - usando staffMedicoId existente:', staffMedicoIdExistente);
      console.log('Horarios a guardar:', horarios);
      console.log('Especialidad seleccionada:', this.especialidadSeleccionada);

      // Asegurar que siempre tengamos una especialidad asociada
      const especialidadFinal = this.especialidadSeleccionada || 
                                this.disponibilidadEditando.especialidadId || 
                                (this.especialidades.length > 0 ? this.especialidades[0].id : null);

      if (!especialidadFinal) {
        alert('Error: Debe seleccionar una especialidad antes de guardar.');
        this.guardando = false;
        return;
      }

      const disponibilidadActualizada = {
        id: this.disponibilidadEditando.id!,
        staffMedicoId: staffMedicoIdExistente,
        especialidadId: especialidadFinal,
        horarios
      } as DisponibilidadMedico;

      console.log('Actualizando disponibilidad:', disponibilidadActualizada);

      this.disponibilidadService.update(this.disponibilidadEditando.id!, disponibilidadActualizada).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor (actualizar):', response);
          this.guardando = false;
          this.cancelarFormulario();
          // Invalidar cache antes de recargar
          this.invalidarCacheDisponibilidades();
          this.cargarDisponibilidades();
          alert('Horarios actualizados correctamente');
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          this.guardando = false;
          if (error.status === 404) {
            alert('Error: No se encontró el médico. Verifique que su sesión sea válida.');
          } else {
            alert(`Error al actualizar los horarios: ${error.error?.status_text || error.message}`);
          }
        }
      });
    } else {
      // Al crear nueva disponibilidad, obtener o buscar el staffMedicoId
      const staffMedicoIdNum = await this.getOrFetchStaffMedicoId();

      if (!staffMedicoIdNum) {
        alert('Error: No se pudo obtener el ID del médico en el centro. Por favor, verifique su sesión o contacte al administrador.');
        this.guardando = false;
        this.router.navigate(['/login']);
        return;
      }

      // Validar que el ID sea consistente con disponibilidades existentes
      if (this.disponibilidades.length > 0) {
        const idExistente = this.disponibilidades[0].staffMedicoId;
        if (staffMedicoIdNum !== idExistente) {
          console.warn(`Inconsistencia de IDs detectada. Usando ID de disponibilidad existente: ${idExistente}`);
          const staffMedicoIdCorregido = idExistente;
          
          console.log('Modo creación - usando ID corregido:', staffMedicoIdCorregido);
          console.log('Horarios a guardar:', horarios);
          console.log('Especialidad seleccionada:', this.especialidadSeleccionada);

          const nuevaDisponibilidad = {
            id: 0,
            staffMedicoId: staffMedicoIdCorregido,
            especialidadId: this.especialidadSeleccionada,
            horarios
          } as DisponibilidadMedico;

          console.log('Creando nueva disponibilidad con ID corregido:', nuevaDisponibilidad);

          this.disponibilidadService.create(nuevaDisponibilidad).subscribe({
            next: (response) => {
              console.log('Respuesta del servidor (crear):', response);
              this.guardando = false;
              this.cancelarFormulario();
              // Invalidar cache antes de recargar
              this.invalidarCacheDisponibilidades();
              this.cargarDisponibilidades();
              alert('Horarios guardados correctamente');
            },
            error: (error) => {
              console.error('Error al guardar disponibilidad:', error);
              console.error('Error completo:', JSON.stringify(error, null, 2));
              this.guardando = false;
              
              let errorMessage = 'Error desconocido al guardar los horarios';
              
              if (error.status === 404) {
                errorMessage = 'Error: No se encontró el médico. Verifique que su sesión sea válida.';
              } else if (error.status === 400) {
                // Error 400 podría ser el problema del StaffMedico
                if (error.error?.status_text?.includes('StaffMedico no encontrado')) {
                  errorMessage = `Error: El médico con ID ${staffMedicoIdCorregido} no existe en el sistema. Por favor, contacte al administrador o inicie sesión nuevamente.`;
                  console.error('StaffMedico no encontrado con ID corregido:', staffMedicoIdCorregido);
                  
                  // Limpiar localStorage y redirigir al login
                  localStorage.clear();
                  setTimeout(() => {
                    this.router.navigate(['/login']);
                  }, 3000);
                } else {
                  errorMessage = `Error de validación: ${error.error?.status_text || error.error?.message || 'Datos inválidos'}`;
                }
              } else if (error.status === 403) {
                errorMessage = 'Error de permisos. Verifique que su sesión sea válida.';
              } else {
                errorMessage = `Error al guardar los horarios: ${error.error?.status_text || error.error?.message || error.message}`;
              }
              
              alert(errorMessage);
            }
          });
          return;
        }
      }

      // Asegurar que tengamos una especialidad seleccionada
      if (!this.especialidadSeleccionada) {
        alert('Error: Debe seleccionar una especialidad antes de guardar.');
        this.guardando = false;
        return;
      }

      console.log('Modo creación - usando staffMedicoId del localStorage:', staffMedicoIdNum);
      console.log('Horarios a guardar:', horarios);
      console.log('Especialidad seleccionada:', this.especialidadSeleccionada);

      const nuevaDisponibilidad = {
        id: 0,
        staffMedicoId: staffMedicoIdNum,
        especialidadId: this.especialidadSeleccionada,
        horarios
      } as DisponibilidadMedico;

      console.log('Creando nueva disponibilidad:', nuevaDisponibilidad);

      this.disponibilidadService.create(nuevaDisponibilidad).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor (crear):', response);
          this.guardando = false;
          this.cancelarFormulario();
          // Invalidar cache antes de recargar
          this.invalidarCacheDisponibilidades();
          this.cargarDisponibilidades();
          alert('Horarios guardados correctamente');
        },
        error: (error) => {
          console.error('Error al guardar disponibilidad:', error);
          console.error('Error completo:', JSON.stringify(error, null, 2));
          this.guardando = false;
          
          let errorMessage = 'Error desconocido al guardar los horarios';
          
          if (error.status === 404) {
            errorMessage = 'Error: No se encontró el médico. Verifique que su sesión sea válida.';
          } else if (error.status === 400) {
            // Error 400 podría ser el problema del StaffMedico
            if (error.error?.status_text?.includes('StaffMedico no encontrado')) {
              errorMessage = `Error: El médico con ID ${staffMedicoIdNum} no existe en el sistema. Por favor, contacte al administrador o inicie sesión nuevamente.`;
              console.error('StaffMedico no encontrado con ID:', staffMedicoIdNum);
              
              // Limpiar localStorage y redirigir al login
              localStorage.clear();
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 3000);
            } else {
              errorMessage = `Error de validación: ${error.error?.status_text || error.error?.message || 'Datos inválidos'}`;
            }
          } else if (error.status === 403) {
            errorMessage = 'Error de permisos. Verifique que su sesión sea válida.';
          } else {
            errorMessage = `Error al guardar los horarios: ${error.error?.status_text || error.error?.message || error.message}`;
          }
          
          alert(errorMessage);
        }
      });
    }
  }

  editarDisponibilidad(disponibilidad: DisponibilidadMedico) {
    this.modoEdicion = true;
    this.disponibilidadEditando = disponibilidad;
    this.mostrarFormulario = true;
    
    // Asegurar que tenemos la especialidad asociada
    this.especialidadSeleccionada = disponibilidad.especialidadId || null;

    // Debug: verificar qué días están llegando de la BD
    console.log('Disponibilidad a editar:', disponibilidad);
    console.log('Horarios:', disponibilidad.horarios);
    console.log('Especialidad ID:', disponibilidad.especialidadId);

    // Si no tiene especialidadId, es una disponibilidad del sistema anterior
    if (!disponibilidad.especialidadId) {
      console.warn('Disponibilidad sin especialidadId detectada - sistema anterior');
      // Podríamos asignar la primera especialidad disponible o mostrar un selector
      if (this.especialidades.length > 0) {
        this.especialidadSeleccionada = this.especialidades[0].id;
        console.log('Asignando especialidad por defecto:', this.especialidades[0].nombre);
      }
    }

    // Cargar datos para edición - asegurarnos de que el día se cargue correctamente
    this.horariosForm = disponibilidad.horarios?.map((horario: any) => {
      console.log('Día del horario original:', horario.dia);
      const diaNormalizado = this.normalizarDia(horario.dia);
      console.log('Día normalizado:', diaNormalizado);
      return {
        dia: diaNormalizado, // Normalizar el día para que coincida con nuestros valores
        horaInicio: horario.horaInicio.slice(0, 5), // Formato HH:MM
        horaFin: horario.horaFin.slice(0, 5) // Formato HH:MM
      };
    }) || [];

    console.log('Formulario cargado:', this.horariosForm);

    // Si no hay horarios, agregar uno vacío por defecto
    if (this.horariosForm.length === 0) {
      this.agregarHorario();
    }
  }

  eliminarDisponibilidad(disponibilidad: DisponibilidadMedico) {
    if (confirm('¿Estás seguro de eliminar esta disponibilidad? Esta acción no se puede deshacer.')) {
      if (disponibilidad.id) {
        this.disponibilidadService.remove(disponibilidad.id!).subscribe({
          next: () => {
            // Invalidar cache antes de recargar
            this.invalidarCacheDisponibilidades();
            this.cargarDisponibilidades();
            alert('Disponibilidad eliminada correctamente');
          },
          error: (error: any) => {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar la disponibilidad');
          }
        });
      }
    }
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.disponibilidadEditando = null;
    this.horariosForm = [];
    this.especialidadSeleccionada = null;
  }

  volverAlDashboard() {
    this.router.navigate(['/medico-dashboard']);
  }

  private initializeParticles() {
    this.particles = [];
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight
      });
    }
  }

  getTotalHorarios(): number {
    return this.disponibilidades.reduce((total, disponibilidad) => {
      return total + (disponibilidad.horarios?.length || 0);
    }, 0);
  }

  getDiasActivos(): number {
    const diasUnicos = new Set();
    this.disponibilidades.forEach(disponibilidad => {
      disponibilidad.horarios?.forEach((horario: any) => {
        diasUnicos.add(horario.dia);
      });
    });
    return diasUnicos.size;
  }

  // Obtener el nombre de una especialidad por ID
  getNombreEspecialidad(especialidadId: number): string {
    const especialidad = this.especialidades.find(e => e.id === especialidadId);
    return especialidad?.nombre || `Especialidad ID ${especialidadId}`;
  }

  // Verificar si una especialidad ya tiene disponibilidades configuradas
  especialidadTieneDisponibilidades(especialidadId: number): boolean {
    return !!this.disponibilidadesPorEspecialidad[especialidadId] && 
           this.disponibilidadesPorEspecialidad[especialidadId].length > 0;
  }

  // Obtener especialidades disponibles para configurar (que no tengan disponibilidades)
  getEspecialidadesDisponibles(): Especialidad[] {
    return this.especialidades.filter(especialidad => 
      !this.especialidadTieneDisponibilidades(especialidad.id)
    );
  }

  // Iniciar nuevo formulario para una especialidad específica
  nuevaDisponibilidadParaEspecialidad(especialidadId?: number) {
    this.mostrarFormulario = true;
    this.modoEdicion = false;
    this.horariosForm = [];
    this.especialidadSeleccionada = especialidadId || null;
  }

  toggleFormulario() {
    if (this.disponibilidades.length > 0) {
      // Si hay disponibilidades, editar la primera (normalmente solo hay una)
      this.editarDisponibilidad(this.disponibilidades[0]);
    } else {
      // Si no hay disponibilidades, crear nueva
      this.mostrarFormulario = true;
      this.modoEdicion = false;
      this.horariosForm = [];
    }
  }

  private normalizarDia(dia: string): string {
    // Normalizar el día a mayúsculas y sin acentos para que coincida con nuestros valores
    const diaLimpio = dia.toUpperCase()
      .replace('É', 'E')
      .replace('Á', 'A')
      .replace('Í', 'I')
      .replace('Ó', 'O')
      .replace('Ú', 'U');
    
    // Mapear días conocidos
    const mapaDias: { [key: string]: string } = {
      'LUNES': 'LUNES',
      'MARTES': 'MARTES',
      'MIERCOLES': 'MIERCOLES',
      'MIÉRCOLES': 'MIERCOLES',
      'JUEVES': 'JUEVES',
      'VIERNES': 'VIERNES',
      'SABADO': 'SABADO',
      'SÁBADO': 'SABADO',
      'DOMINGO': 'DOMINGO'
    };

    return mapaDias[diaLimpio] || dia; // Si no encuentra el mapeo, devuelve el original
  }
}