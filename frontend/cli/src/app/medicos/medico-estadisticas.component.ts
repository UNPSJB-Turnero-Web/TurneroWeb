import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TurnoService } from '../turnos/turno.service';
import { MedicoService } from './medico.service';
import { AuditService } from '../audit/audit.service';
import { StaffMedicoService } from '../staffMedicos/staffMedico.service';

interface EstadisticasPeriodo {
  periodo: string;
  turnosRealizados: number;
  turnosCancelados: number;
  pacientesAtendidos: number;
  horasTrabajadas: number;
  ingresos?: number;
}

interface EstadisticasEspecialidad {
  especialidad: string;
  cantidad: number;
  porcentaje: number;
}

@Component({
  selector: 'app-medico-estadisticas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medico-estadisticas.component.html',
  styleUrl: './medico-estadisticas.component.css'
})
export class MedicoEstadisticasComponent implements OnInit {
  periodoSeleccionado = 'mes_actual';
  medicoData: any = null;
  especialidadMedico: string = '';
  
  estadisticasActuales: EstadisticasPeriodo = {
    periodo: 'Mes Actual',
    turnosRealizados: 0,
    turnosCancelados: 0,
    pacientesAtendidos: 0,
    horasTrabajadas: 0
  };

  evolutionData: EstadisticasPeriodo[] = [];
  especialidadesStats: EstadisticasEspecialidad[] = [];
  rendimientoMensual: EstadisticasPeriodo[] = [];

  comparativas = {
    turnosRealizados: 0,
    pacientesAtendidos: 0,
    horasTrabajadas: 0,
    tasaCancelacion: 0
  };

  periodosDisponibles = [
    { nombre: 'Esta Semana', valor: 'semana_actual' },
    { nombre: 'Este Mes', valor: 'mes_actual' },
    { nombre: 'Este Cuatrimestre', valor: 'cuatrimestre' },
    { nombre: 'Este Año', valor: 'ano_actual' }
  ];

  Math = Math; // Para usar Math en el template

  constructor(
    private router: Router, 
    private turnoService: TurnoService,
    private medicoService: MedicoService,
    private auditService: AuditService,
    private staffMedicoService: StaffMedicoService
  ) {}

  async ngOnInit() {
    // Asegurar que staffMedicoId esté disponible en localStorage
    await this.getOrFetchStaffMedicoId();
    this.cargarDatosMedico();
  }

  cargarDatosMedico() {
    // Obtener datos del médico desde localStorage
    const medicoDataStr = localStorage.getItem('medicoData');
    if (medicoDataStr) {
      this.medicoData = JSON.parse(medicoDataStr);
      this.especialidadMedico = this.medicoData?.especialidad?.nombre || '';
      this.cargarEstadisticas();
    } else {
      // Fallback: obtener desde API si no está en localStorage
      const medicoId = localStorage.getItem('medicoId');
      if (medicoId && medicoId !== '0') {
        this.medicoService.findById(parseInt(medicoId, 10)).subscribe({
          next: (medico) => {
            this.medicoData = medico;
            this.especialidadMedico = medico?.especialidad?.nombre || '';
            this.cargarEstadisticas();
          },
          error: (error) => {
            console.error('Error al cargar datos del médico:', error);
            this.cargarEstadisticasConDatosPorDefecto();
          }
        });
      } else {
        console.warn('No hay medicoId válido en localStorage');
        this.cargarEstadisticasConDatosPorDefecto();
      }
    }
  }

  cargarEstadisticas() {
    // Primero obtener el staffMedicoId correcto basado en el medicoId en sesión
    this.obtenerStaffMedicoIdCorrect();
  }

  private obtenerStaffMedicoIdCorrect() {
    // Primero intentar obtener staffMedicoId desde localStorage
    const staffMedicoIdFromStorage = localStorage.getItem('staffMedicoId');
    
    if (staffMedicoIdFromStorage && staffMedicoIdFromStorage !== 'null' && staffMedicoIdFromStorage !== '0') {
      const parsedStaffId = parseInt(staffMedicoIdFromStorage, 10);
      if (parsedStaffId > 0) {
        console.log('📋 Usando staffMedicoId desde localStorage:', parsedStaffId);
        this.cargarEstadisticasTurnos(parsedStaffId);
        return;
      }
    }
    
    // Si no está en localStorage, buscar por medicoId
    const medicoId = this.getMedicoIdFromSession();
    console.log('🔍 Buscando StaffMedico por medicoId:', medicoId);
    
    this.staffMedicoService.all().subscribe({
      next: (response: any) => {
        const staffMedicos = response?.data || [];
        
        // Buscar TODOS los StaffMedico que corresponden al médico en sesión
        const staffMedicosDelMedico = staffMedicos.filter((sm: any) => sm.medico && sm.medico.id === medicoId);
        
        if (staffMedicosDelMedico.length > 0) {
          console.log(`✅ Encontrados ${staffMedicosDelMedico.length} registros de StaffMedico para el médico:`, staffMedicosDelMedico);
          
          // Guardar el staffMedicoId en localStorage para próximos usos
          const staffMedicoId = staffMedicosDelMedico[0].id;
          localStorage.setItem('staffMedicoId', staffMedicoId.toString());
          
          this.cargarEstadisticasTurnos(staffMedicoId);
        } else {
          console.error('❌ No se encontraron registros de StaffMedico para medicoId:', medicoId);
          // Como fallback, intentar usar directamente el medicoId
          this.cargarEstadisticasTurnos(medicoId);
        }
      },
      error: (error: any) => {
        console.error('❌ Error al obtener StaffMedicos:', error);
        // Como fallback, intentar usar directamente el medicoId
        this.cargarEstadisticasTurnos(this.getMedicoIdFromSession());
      }
    });

    // Inicializar especialidades mientras se cargan los datos
    this.inicializarEspecialidades();
  }

  /**
   * Inicializa las especialidades del médico para mostrar en el UI
   */
  private inicializarEspecialidades() {
    if (this.especialidadMedico) {
      this.especialidadesStats = [
        { 
          especialidad: this.especialidadMedico, 
          cantidad: 0,
          porcentaje: 100 
        }
      ];
    }
  }

  cargarEstadisticasTurnos(staffMedicoId: number) {
    console.log(`🔍 Cargando estadísticas para staffMedicoId: ${staffMedicoId}, período: ${this.periodoSeleccionado}`);
    
    // Obtener turnos específicos del médico usando el staffMedicoId correcto
    const filtro = this.getFiltroParaPeriodo();
    const turnosFilter = {
      staffMedicoId: staffMedicoId,
      ...filtro,
      size: 1000 // Aumentar el límite para obtener más datos
    };
    
    console.log('🔎 Filtros aplicados:', turnosFilter);
    
    this.turnoService.searchWithSimpleFilters(turnosFilter).subscribe({
      next: (turnosResponse: any) => {
        const turnos = turnosResponse.data || [];
        console.log(`📊 Turnos encontrados: ${turnos.length}`, turnos.length > 0 ? turnos.slice(0, 3) : []);
        
        if (turnos.length > 0) {
          // Procesar turnos y generar todas las estadísticas
          this.procesarTurnosYEstadisticas(turnos);
        } else {
          console.log('⚠️ No se encontraron turnos para este médico en el período seleccionado');
          
          // Mostrar estadísticas vacías pero mantener la especialidad
          this.estadisticasActuales = {
            periodo: this.getPeriodoNombre(),
            turnosRealizados: 0,
            turnosCancelados: 0,
            pacientesAtendidos: 0,
            horasTrabajadas: 0
          };
          
          // Limpiar gráficos
          this.evolutionData = [];
          this.rendimientoMensual = [];
          
          // Mantener especialidades si hay datos del médico
          if (this.especialidadMedico) {
            this.especialidadesStats = [
              { 
                especialidad: this.especialidadMedico, 
                cantidad: 0,
                porcentaje: 100 
              }
            ];
          } else {
            this.especialidadesStats = [];
          }
        }
      },
      error: (error: any) => {
        console.error('❌ Error al obtener turnos del médico:', error);
        console.error('Error details:', error);
        this.cargarEstadisticasSimuladas();
      }
    });
  }

  cargarEstadisticasSimuladas() {
    console.log('⚠️ Cargando estadísticas simuladas como fallback');
    
    // Datos simulados como fallback
    this.estadisticasActuales = {
      periodo: this.getPeriodoNombre(),
      turnosRealizados: 0,
      turnosCancelados: 0,
      pacientesAtendidos: 0,
      horasTrabajadas: 0
    };

    // Limpiar gráficos
    this.evolutionData = [];
    this.rendimientoMensual = [];
    
    // Mantener especialidad del médico si está disponible
    this.inicializarEspecialidades();
    
    // Comparativas vacías
    this.comparativas = {
      turnosRealizados: 0,
      pacientesAtendidos: 0,
      horasTrabajadas: 0,
      tasaCancelacion: 0
    };
  }

  cargarEstadisticasConDatosPorDefecto() {
    this.especialidadMedico = 'Sin especialidad';
    this.especialidadesStats = [
      { 
        especialidad: 'Sin especialidad', 
        cantidad: 0, 
        porcentaje: 100 
      }
    ];
    this.cargarEstadisticasSimuladas();

    this.rendimientoMensual = [
      { periodo: 'Enero', turnosRealizados: 75, turnosCancelados: 8, pacientesAtendidos: 58, horasTrabajadas: 140 },
      { periodo: 'Febrero', turnosRealizados: 82, turnosCancelados: 10, pacientesAtendidos: 62, horasTrabajadas: 148 },
      { periodo: 'Marzo', turnosRealizados: 89, turnosCancelados: 12, pacientesAtendidos: 67, horasTrabajadas: 156 }
    ];

    this.comparativas = {
      turnosRealizados: 8.5,
      pacientesAtendidos: 12.3,
      horasTrabajadas: 5.4,
      tasaCancelacion: -2.1
    };
  }

  seleccionarPeriodo(periodo: string) {
    this.periodoSeleccionado = periodo;
    this.cargarEstadisticas(); // Recargar con nuevo período
  }

  private getMedicoIdFromSession(): number {
    const medicoId = localStorage.getItem('medicoId');
    const parsedId = medicoId ? parseInt(medicoId, 10) : 0;
    
    // Si el ID es 0 o inválido, intentar obtenerlo de medicoData
    if (parsedId <= 0 && this.medicoData?.id) {
      return this.medicoData.id;
    }
    
    return parsedId > 0 ? parsedId : 1; // Fallback a 1 si todo falla
  }

  /**
   * Obtiene el ID del StaffMedico desde localStorage
   * Este es el ID que se usa para relacionar con turnos
   */
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
      const medicoId = this.getMedicoIdFromSession();
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

  // Keep the synchronous method for backward compatibility
  private getStaffMedicoIdFromSession(): number {
    // Primero intentar con el staffMedicoId del localStorage
    const staffMedicoId = localStorage.getItem('staffMedicoId');
    if (staffMedicoId && staffMedicoId !== 'null' && staffMedicoId !== '0') {
      const parsedStaffId = parseInt(staffMedicoId, 10);
      if (parsedStaffId > 0) {
        return parsedStaffId;
      }
    }

    // Fallback: usar el medicoId como staffMedicoId
    return this.getMedicoIdFromSession();
  }
  

  private getFiltroParaPeriodo(): any {
    const ahora = new Date();
    let filtro: any = {};

    switch (this.periodoSeleccionado) {
      case 'semana_actual':
        const inicioSemana = new Date(ahora);
        // Lunes como inicio de semana (0=domingo, 1=lunes)
        const diaActual = inicioSemana.getDay();
        const diasHastaLunes = diaActual === 0 ? -6 : -(diaActual - 1);
        inicioSemana.setDate(ahora.getDate() + diasHastaLunes);
        
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6);
        
        filtro.fechaDesde = inicioSemana.toISOString().split('T')[0];
        filtro.fechaHasta = finSemana.toISOString().split('T')[0];
        break;
        
      case 'mes_actual':
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
        filtro.fechaDesde = inicioMes.toISOString().split('T')[0];
        filtro.fechaHasta = finMes.toISOString().split('T')[0];
        break;
      
      case 'cuatrimestre':
        // Calcular cuatrimestre actual (4 meses)
        // Cuatrimestres: Ene-Abr (0-3), May-Ago (4-7), Sep-Dic (8-11)
        const mesActual = ahora.getMonth();
        const cuatrimestreInicio = Math.floor(mesActual / 4) * 4;
        const inicioCuatrimestre = new Date(ahora.getFullYear(), cuatrimestreInicio, 1);
        const finCuatrimestre = new Date(ahora.getFullYear(), cuatrimestreInicio + 4, 0);
        filtro.fechaDesde = inicioCuatrimestre.toISOString().split('T')[0];
        filtro.fechaHasta = finCuatrimestre.toISOString().split('T')[0];
        break;
      
      case 'ano_actual':
        const inicioAño = new Date(ahora.getFullYear(), 0, 1);
        const finAño = new Date(ahora.getFullYear(), 11, 31);
        filtro.fechaDesde = inicioAño.toISOString().split('T')[0];
        filtro.fechaHasta = finAño.toISOString().split('T')[0];
        break;
        
      default:
        // Si no se especifica período, usar el mes actual
        const inicioDefault = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const finDefault = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
        filtro.fechaDesde = inicioDefault.toISOString().split('T')[0];
        filtro.fechaHasta = finDefault.toISOString().split('T')[0];
        break;
    }

    console.log(`📅 Filtro de período generado para ${this.periodoSeleccionado}:`, filtro);
    return filtro;
  }

  /**
   * Procesa los turnos y genera todas las estadísticas necesarias
   */
  private procesarTurnosYEstadisticas(turnos: any[]) {
    console.log('📊 Procesando turnos para estadísticas:', turnos.length, 'turnos');
    console.log('📊 Estados de turnos encontrados:', turnos.map(t => `${t.id}: ${t.estado} - ${t.fecha} ${t.hora}`));
    
    // Definir estados que pueden contar como "realizados" (pero aún necesitan filtro por fecha)
    const estadosRealizados = ['CONFIRMADO', 'COMPLETADO', 'REALIZADO'];
    const estadosCancelados = ['CANCELADO'];
    const estadosProgramados = ['PROGRAMADO'];
    
    // Obtener fecha y hora actual
    const ahora = new Date();
    console.log('⏰ Fecha/hora actual para comparación:', ahora.toLocaleString('es-ES'));
    
    
    // Filtrar turnos por estado Y por fecha (solo contar como realizados los que ya pasaron)
    const turnosRealizados = turnos.filter(t => 
      estadosRealizados.includes(t.estado) && this.turnoYaPaso(t)
    );
    const turnosCancelados = turnos.filter(t => estadosCancelados.includes(t.estado));
    const turnosProgramados = turnos.filter(t => estadosProgramados.includes(t.estado));
    
    // Separar turnos programados entre pasados y futuros
    const turnosProgramadosPasados = turnosProgramados.filter(t => this.turnoYaPaso(t));
    const turnosProgramadosFuturos = turnosProgramados.filter(t => !this.turnoYaPaso(t));
    
    // Calcular estadísticas básicas (solo con turnos que ya pasaron)
    const turnosEfectivamenteRealizados = [...turnosRealizados, ...turnosProgramadosPasados];
    const horasTrabajadas = this.calcularHorasTrabajadasReales(turnosEfectivamenteRealizados);
    const pacientesUnicos = this.contarPacientesUnicos(turnosEfectivamenteRealizados);
    
    const totalTurnosRealizados = turnosRealizados.length;
    const totalTurnosCancelados = turnosCancelados.length;
    const totalTurnosProgramadosPasados = turnosProgramadosPasados.length;
    const totalTurnosProgramadosFuturos = turnosProgramadosFuturos.length;
    const totalTurnos = turnos.length;
    
    console.log(`📈 Conteos por estado y tiempo:
      - Realizados (estados válidos + fecha pasada): ${totalTurnosRealizados}
      - Programados pasados (contados como realizados): ${totalTurnosProgramadosPasados}
      - Programados futuros (NO contados): ${totalTurnosProgramadosFuturos}
      - Cancelados: ${totalTurnosCancelados}
      - Total efectivamente realizados: ${turnosEfectivamenteRealizados.length}
      - Total turnos: ${totalTurnos}`);
    
    // Establecer estadísticas actuales (solo contar turnos que ya pasaron)
    this.estadisticasActuales = {
      periodo: this.getPeriodoNombre(),
      turnosRealizados: turnosEfectivamenteRealizados.length, // Solo turnos que ya pasaron
      turnosCancelados: totalTurnosCancelados,
      pacientesAtendidos: pacientesUnicos,
      horasTrabajadas: parseFloat(horasTrabajadas.toFixed(1)) // Redondear a 1 decimal
    };
    
    // Generar datos para gráfico de evolución temporal
    this.generarDatosEvolucion(turnos);
    
    // Generar estadísticas por especialidad
    this.generarEstadisticasEspecialidades(turnos);
    
    // Generar rendimiento mensual
    this.generarRendimientoMensual(turnos);
    
    // Generar datos de comparativa (simulados por ahora)
    this.generarDatosComparativos();
    
    console.log('✅ Estadísticas procesadas:', this.estadisticasActuales);
  }

  /**
   * Helper para determinar si un turno ya pasó (puede ser reutilizado por otros métodos)
   */
  private turnoYaPaso(turno: any): boolean {
    try {
      // Combinar fecha y hora del turno
      const fechaTurno = new Date(`${turno.fecha}T${turno.hora}`);
      const ahora = new Date();
      return fechaTurno <= ahora;
    } catch (error) {
      console.warn(`⚠️ Error procesando fecha/hora del turno ${turno.id}:`, error);
      return false; // Si no se puede determinar, no contar como realizado
    }
  }

  /**
   * Parsea una fecha en formato YYYY-MM-DD evitando problemas de zona horaria
   */
  private parsearFecha(fechaStr: string): Date {
    const [year, month, day] = fechaStr.split('-').map(Number);
    const fecha = new Date(year, month - 1, day); // month - 1 porque Date usa 0-11 para meses
    console.log(`📅 Parseando fecha: ${fechaStr} -> ${fecha.toLocaleDateString('es-ES')}`);
    return fecha;
  }

  /**
   * Genera datos comparativos con períodos anteriores (simulados por ahora)
   */
  private generarDatosComparativos() {
    // Por ahora generar comparativas simuladas
    // En una implementación completa, se obtendría del período anterior
    this.comparativas = {
      turnosRealizados: Math.random() * 20 - 10, // Entre -10% y +10%
      pacientesAtendidos: Math.random() * 15 - 7.5, // Entre -7.5% y +7.5%
      horasTrabajadas: Math.random() * 12 - 6, // Entre -6% y +6%
      tasaCancelacion: Math.random() * 8 - 4 // Entre -4% y +4%
    };
    
    // Redondear a 1 decimal
    Object.keys(this.comparativas).forEach(key => {
      this.comparativas[key as keyof typeof this.comparativas] = 
        Math.round(this.comparativas[key as keyof typeof this.comparativas] * 10) / 10;
    });
    
    console.log('📊 Comparativas generadas:', this.comparativas);
  }

  /**
   * Genera datos de evolución temporal para el gráfico
   */
  private generarDatosEvolucion(turnos: any[]) {
    const datosAgrupados = new Map<string, any>();
    const estadosRealizados = ['CONFIRMADO', 'COMPLETADO', 'REALIZADO'];
    const estadosCancelados = ['CANCELADO'];
    const estadosProgramados = ['PROGRAMADO'];
    
    turnos.forEach(turno => {
      if (!turno.fecha) return;
      
      // Parsear fecha correctamente evitando problemas de zona horaria
      const fecha = this.parsearFecha(turno.fecha);
      let clave = '';
      
      // Agrupar según el período seleccionado
      switch (this.periodoSeleccionado) {
        case 'semana_actual':
          clave = fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'numeric' });
          break;
        case 'mes_actual':
          clave = `Sem ${Math.ceil(fecha.getDate() / 7)}`;
          break;
        case 'cuatrimestre':
          clave = fecha.toLocaleDateString('es-ES', { month: 'short' });
          break;
        case 'ano_actual':
          clave = fecha.toLocaleDateString('es-ES', { month: 'short' });
          break;
        default:
          clave = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric' });
      }
      
      if (!datosAgrupados.has(clave)) {
        datosAgrupados.set(clave, {
          periodo: clave,
          turnosRealizados: 0,
          turnosCancelados: 0,
          turnosProgramados: 0,
          pacientesAtendidos: new Set(),
          horasTrabajadas: 0
        });
      }
      
      const datos = datosAgrupados.get(clave);
      
      // Solo contar como realizados los turnos que ya pasaron
      if (estadosRealizados.includes(turno.estado) && this.turnoYaPaso(turno)) {
        datos.turnosRealizados++;
        // Calcular horas trabajadas solo para turnos realizados
        if (turno.horaInicio && turno.horaFin) {
          try {
            const horas = this.calcularDuracionTurnoEnMinutos(turno.horaInicio, turno.horaFin) / 60;
            datos.horasTrabajadas += horas;
          } catch (error) {
            console.warn('Error calculando horas para evolución:', error);
          }
        }
      } else if (estadosCancelados.includes(turno.estado)) {
        datos.turnosCancelados++;
      } else if (estadosProgramados.includes(turno.estado) && this.turnoYaPaso(turno)) {
        // Solo contar programados que ya pasaron como realizados
        datos.turnosProgramados++;
      }
      
      if (turno.pacienteId) {
        datos.pacientesAtendidos.add(turno.pacienteId);
      }
    });
    
    // Convertir a array y ordenar cronológicamente
    this.evolutionData = Array.from(datosAgrupados.values())
      .map(datos => ({
        periodo: datos.periodo,
        turnosRealizados: datos.turnosRealizados + datos.turnosProgramados, // Incluir programados en el gráfico
        turnosCancelados: datos.turnosCancelados,
        pacientesAtendidos: datos.pacientesAtendidos.size,
        horasTrabajadas: Math.round(datos.horasTrabajadas * 10) / 10 // Redondear a 1 decimal
      }))
      .sort((a, b) => {
        // Ordenamiento básico por nombre de período
        return a.periodo.localeCompare(b.periodo);
      });
    
    console.log('📈 Datos de evolución generados:', this.evolutionData);
  }

  /**
   * Genera estadísticas por especialidad usando el campo especialidadStaffMedico
   */
  private generarEstadisticasEspecialidades(turnos: any[]) {
    const especialidadesMap = new Map<string, number>();
    const estadosContables = ['CONFIRMADO', 'COMPLETADO', 'REALIZADO', 'PROGRAMADO'];
    
    turnos.forEach(turno => {
      // Solo contar turnos que ya pasaron para estadísticas de especialidades
      if (turno.especialidadStaffMedico && estadosContables.includes(turno.estado) && this.turnoYaPaso(turno)) {
        const especialidad = turno.especialidadStaffMedico;
        especialidadesMap.set(especialidad, (especialidadesMap.get(especialidad) || 0) + 1);
      }
    });
    
    const totalTurnos = Array.from(especialidadesMap.values()).reduce((a, b) => a + b, 0);
    
    if (totalTurnos > 0) {
      this.especialidadesStats = Array.from(especialidadesMap.entries()).map(([especialidad, cantidad]) => ({
        especialidad,
        cantidad,
        porcentaje: Math.round((cantidad / totalTurnos) * 100)
      }));
    } else {
      // Fallback: usar la especialidad del médico si no hay turnos
      if (this.especialidadMedico) {
        this.especialidadesStats = [
          { 
            especialidad: this.especialidadMedico, 
            cantidad: 0,
            porcentaje: 100 
          }
        ];
      } else {
        this.especialidadesStats = [];
      }
    }
    
    console.log('🏥 Estadísticas por especialidad:', this.especialidadesStats);
  }

  /**
   * Genera datos de rendimiento mensual
   */
  private generarRendimientoMensual(turnos: any[]) {
    const mesesMap = new Map<string, any>();
    const estadosRealizados = ['CONFIRMADO', 'COMPLETADO', 'REALIZADO'];
    const estadosCancelados = ['CANCELADO'];
    const estadosProgramados = ['PROGRAMADO'];
    
    turnos.forEach(turno => {
      if (!turno.fecha) return;
      
      // Parsear fecha correctamente evitando problemas de zona horaria
      const fecha = this.parsearFecha(turno.fecha);
      const claveMes = `${fecha.getFullYear()}-${fecha.getMonth()}`;
      const nombreMes = fecha.toLocaleDateString('es-ES', { 
        month: 'long', 
        year: fecha.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined 
      });
      
      if (!mesesMap.has(claveMes)) {
        mesesMap.set(claveMes, {
          periodo: nombreMes,
          turnosRealizados: 0,
          turnosCancelados: 0,
          turnosProgramados: 0,
          pacientesAtendidos: new Set(),
          horasTrabajadas: 0,
          fecha: fecha
        });
      }
      
      const datosMes = mesesMap.get(claveMes);
      
      // Solo contar como realizados los turnos que ya pasaron
      if (estadosRealizados.includes(turno.estado) && this.turnoYaPaso(turno)) {
        datosMes.turnosRealizados++;
        // Calcular horas para este turno
        if (turno.horaInicio && turno.horaFin) {
          try {
            const horas = this.calcularDuracionTurnoEnMinutos(turno.horaInicio, turno.horaFin) / 60;
            datosMes.horasTrabajadas += horas;
          } catch (error) {
            console.warn('Error calculando horas mensuales:', error);
          }
        }
      } else if (estadosCancelados.includes(turno.estado)) {
        datosMes.turnosCancelados++;
      } else if (estadosProgramados.includes(turno.estado) && this.turnoYaPaso(turno)) {
        // Solo contar programados que ya pasaron como realizados
        datosMes.turnosProgramados++;
      }
      
      if (turno.pacienteId) {
        datosMes.pacientesAtendidos.add(turno.pacienteId);
      }
    });
    
    // Convertir a array y ordenar cronológicamente
    this.rendimientoMensual = Array.from(mesesMap.values())
      .map(datos => ({
        periodo: datos.periodo,
        turnosRealizados: datos.turnosRealizados + datos.turnosProgramados, // Incluir programados
        turnosCancelados: datos.turnosCancelados,
        pacientesAtendidos: datos.pacientesAtendidos.size,
        horasTrabajadas: Math.round(datos.horasTrabajadas * 10) / 10, // Redondear a 1 decimal
        fecha: datos.fecha
      }))
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime()) // Ordenar por fecha
      .map(({fecha, ...resto}) => resto); // Remover fecha del resultado final
    
    console.log('📅 Rendimiento mensual:', this.rendimientoMensual);
  }

  /**
   * Calcula la duración de un turno en horas (versión legacy para compatibilidad)
   */
  private calcularDuracionTurno(horaInicio: string, horaFin: string): number {
    const duracionMinutos = this.calcularDuracionTurnoEnMinutos(horaInicio, horaFin);
    return duracionMinutos / 60; // Convertir a horas
  }

  getPeriodoNombre(): string {
    const periodo = this.periodosDisponibles.find(p => p.valor === this.periodoSeleccionado);
    return periodo ? periodo.nombre : 'Período Actual';
  }

  /**
   * Calcula las horas trabajadas reales basándose en horaInicio y horaFin de los turnos
   */
  private calcularHorasTrabajadasReales(turnos: any[]): number {
    let totalMinutos = 0;
    let turnosProcessed = 0;
    
    turnos.forEach(turno => {
      if (turno.horaInicio && turno.horaFin) {
        try {
          const duracionMinutos = this.calcularDuracionTurnoEnMinutos(turno.horaInicio, turno.horaFin);
          if (duracionMinutos > 0) {
            totalMinutos += duracionMinutos;
            turnosProcessed++;
            console.log(`🕐 Turno ${turno.id}: ${turno.horaInicio}-${turno.horaFin} = ${duracionMinutos} minutos (${turno.estado})`);
          }
        } catch (error) {
          console.warn(`⚠️ Error al parsear horas del turno ${turno.id}:`, turno.horaInicio, '-', turno.horaFin, error);
        }
      }
    });
    
    const totalHoras = totalMinutos / 60;
    console.log(`📊 Horas calculadas: ${turnosProcessed} turnos procesados, ${totalMinutos} minutos = ${totalHoras.toFixed(2)} horas`);
    
    return totalHoras;
  }

  /**
   * Calcula la duración de un turno en minutos
   */
  private calcularDuracionTurnoEnMinutos(horaInicio: string, horaFin: string): number {
    // Parsear las horas (formato esperado: "HH:MM:SS" o "HH:MM")
    const parseTime = (timeStr: string): { hours: number, minutes: number } => {
      const parts = timeStr.split(':');
      return {
        hours: parseInt(parts[0], 10),
        minutes: parseInt(parts[1], 10)
      };
    };
    
    const inicio = parseTime(horaInicio);
    const fin = parseTime(horaFin);
    
    // Validar que los valores sean números válidos
    if (isNaN(inicio.hours) || isNaN(inicio.minutes) || isNaN(fin.hours) || isNaN(fin.minutes)) {
      throw new Error(`Formato de hora inválido: ${horaInicio} - ${horaFin}`);
    }
    
    const inicioEnMinutos = inicio.hours * 60 + inicio.minutes;
    const finEnMinutos = fin.hours * 60 + fin.minutes;
    
    // Calcular duración en minutos
    let duracionMinutos = finEnMinutos - inicioEnMinutos;
    
    // Manejar caso donde el turno cruza medianoche
    if (duracionMinutos < 0) {
      duracionMinutos += 24 * 60; // Sumar 24 horas
    }
    
    // Validación de duración razonable (entre 5 minutos y 12 horas)
    if (duracionMinutos < 5 || duracionMinutos > 12 * 60) {
      console.warn(`⚠️ Duración de turno sospechosa: ${duracionMinutos} minutos (${horaInicio}-${horaFin})`);
    }
    
    return duracionMinutos;
  }

  /**
   * Cuenta los pacientes únicos atendidos
   */
  private contarPacientesUnicos(turnos: any[]): number {
    const pacientesSet = new Set();
    const estadosContables = ['CONFIRMADO', 'COMPLETADO', 'REALIZADO', 'PROGRAMADO'];
    
    turnos.forEach(turno => {
      if (turno.pacienteId && estadosContables.includes(turno.estado)) {
        pacientesSet.add(turno.pacienteId);
      }
    });
    
    const totalPacientes = pacientesSet.size;
    console.log(`👥 Pacientes únicos calculados: ${totalPacientes} de ${turnos.length} turnos`);
    
    return totalPacientes;
  }

  volverAlDashboard() {
    this.router.navigate(['/medico-dashboard']);
  }

  calcularTasaCancelacion(): number {
    const total = this.estadisticasActuales.turnosRealizados + this.estadisticasActuales.turnosCancelados;
    if (total === 0) return 0;
    return Math.round((this.estadisticasActuales.turnosCancelados / total) * 100);
  }

  calcularTasaExito(stat: EstadisticasPeriodo): number {
    const total = stat.turnosRealizados + stat.turnosCancelados;
    if (total === 0) return 0;
    return Math.round((stat.turnosRealizados / total) * 100);
  }

  getMaxTurnos(): number {
    return Math.max(...this.evolutionData.map(d => d.turnosRealizados), 1);
  }

  // Export methods
  exportarExcel() {
    console.log('Exportando estadísticas a Excel...');
    // TODO: Implement Excel export
  }

  exportarPDF() {
    console.log('Generando reporte PDF...');
    // TODO: Implement PDF report generation
  }

  enviarPorEmail() {
    console.log('Enviando estadísticas por email...');
    // TODO: Implement email functionality
  }

  programarReporte() {
    console.log('Programando reporte automático...');
    // TODO: Implement scheduled reports
  }
}