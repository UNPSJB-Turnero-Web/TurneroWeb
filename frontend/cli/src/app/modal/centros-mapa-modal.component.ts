import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import * as L from "leaflet";
import { HttpClient } from "@angular/common/http";
import { CentroAtencion } from "../centrosAtencion/centroAtencion";
import { Especialidad } from "../especialidades/especialidad";
import { CentroEspecialidad } from "../centrosAtencion/centro-especialidad";
import { CentroEspecialidadService } from "../centrosAtencion/centro-especialidad.service";
import {
  GeolocationService,
  UserLocation,
} from "../services/geolocation.service";
import { UserContextService } from "../services/user-context.service";
import { Role } from "../inicio-sesion/auth.service";

interface CentroMapaInfo extends CentroAtencion {
  distanciaKm?: number;
  especialidadesDisponibles?: string[];
}

@Component({
  selector: "app-centros-mapa-modal",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./centros-mapa-modal.component.html",
  styleUrl: "./centros-mapa-modal.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CentrosMapaModalComponent implements OnInit, OnDestroy {
  @Input() centros: CentroAtencion[] = [];
  @Input() especialidades: Especialidad[] = [];
  @Input() slotsDisponibles: any[] = []; // Slots/turnos disponibles del componente padre
  @Input() especialidadSeleccionadaInicial: string = "";
  @Output() centroSeleccionado = new EventEmitter<CentroAtencion>();
  @Output() modalCerrado = new EventEmitter<void>();
  @ViewChild("mapContainer", { static: true })
  mapContainer!: ElementRef<HTMLDivElement>;

  // Mapa
  private map!: L.Map;
  private markers: L.Marker[] = [];
  private userMarker: L.Marker | null = null;

  // Filtros
  especialidadFiltro: string = "";
  radioMaximo: number = 50; // km

  // Búsqueda
  busquedaTexto: string = "";
  resultadosBusqueda: CentroMapaInfo[] = [];

  // Ubicación
  userLocation: UserLocation | null = null;
  isLoadingLocation = false;
  locationError: string | null = null;
  showManualLocationForm = false;
  direccionBusqueda = "";
  latitudManual: number | null = null;
  longitudManual: number | null = null;
  
  // Modo ubicación manual por arrastre
  modoArrastre = false;
  iconoCentroFijo: HTMLElement | null = null;

  // Estado del mapa - CONTROL DE LAYOUT
  modoExploracion = true; // true = mapa grande, false = mapa franja + lista grande
  ubicacionConfirmada = false; // true cuando el usuario confirma su ubicación

  // Estado
  centrosFiltrados: CentroMapaInfo[] = [];
  centroActualSeleccionado: CentroMapaInfo | null = null;
  especialidadesDisponibles: Especialidad[] = [];
  ordenadoPorDistancia = false;

  // Relaciones centro-especialidad
  centroEspecialidades: CentroEspecialidad[] = [];

  // Cache para conteo de especialidades
  private conteoEspecialidadesCache = new Map<string, number>();
  private lastCentrosFiltradosLength = 0;

  // Modal pequeño de información del centro
  mostrarModalInfoCentro = false;
  centroInfoModal: CentroMapaInfo | null = null;

  constructor(
    private http: HttpClient,
    private geolocationService: GeolocationService,
    private centroEspecialidadService: CentroEspecialidadService,
    private userContextService: UserContextService
  ) {}

  ngOnInit() {
    // console.log('🗺️ Inicializando modal de centros...');
    // console.log('- Centros recibidos:', this.centros?.length || 0);
    // console.log('- Especialidades recibidas:', this.especialidades?.length || 0);
    // console.log('- Especialidad inicial:', this.especialidadSeleccionadaInicial);

    // Establecer referencia global para los botones del popup
    (window as any).centrosModalComponent = this;

    // Establecer el filtro inicial ANTES de inicializar datos
    if (this.especialidadSeleccionadaInicial) {
      this.especialidadFiltro = this.especialidadSeleccionadaInicial;
    }

    // Inicializar datos del modal (esto cargará las especialidades del padre)
    this.inicializarDatos();
  }

  ngOnDestroy() {
    // Limpiar referencia global
    if ((window as any).centrosModalComponent === this) {
      delete (window as any).centrosModalComponent;
    }

    // Desactivar modo arrastre si está activo
    if (this.modoArrastre) {
      this.desactivarModoArrastre();
    }

    // Limpiar mapa
    if (this.map) {
      this.map.remove();
    }
  }

  ngAfterViewInit() {
    // No inicializar el mapa aquí, se inicializa en cargarCentroEspecialidades
    // después de cargar todos los datos
  }

  inicializarDatos() {
    // console.log('🔧 Inicializando datos del modal...');
    // console.log('🏥 Centros recibidos:', this.centros?.length || 0);

    // Cargar las relaciones centro-especialidad
    this.cargarCentroEspecialidades();
  }

  cargarCentroEspecialidades() {
    // console.log('📋 Procesando datos basados en slots disponibles...');
    // console.log('- Slots recibidos:', this.slotsDisponibles?.length || 0);

    if (!this.slotsDisponibles || this.slotsDisponibles.length === 0) {
      // console.log('⚠️ No hay slots disponibles, cargando desde relaciones centro-especialidad como fallback');
      this.cargarCentroEspecialidadesFromService();
      return;
    }

    // Extraer especialidades únicas disponibles desde los slots
    this.extraerEspecialidadesDisponibles();

    // Procesar centros con sus especialidades reales
    this.procesarCentros();

    // Aplicar filtros después de procesar los datos
    this.aplicarFiltros();

    // Inicializar mapa
    setTimeout(() => this.inicializarMapa(), 100);
  }
  
    /**
   * Verifica si el usuario tiene capacidades administrativas (staff médico u operador)
   * Gracias a la jerarquía de roles, ADMINISTRADOR hereda automáticamente OPERADOR y MEDICO
   */
  get esOperador(): boolean {
    return this.userContextService.hasAnyRole([Role.OPERADOR, Role.MEDICO]);
  }

  cargarCentroEspecialidadesFromService() {
    this.centroEspecialidadService.all().subscribe({
      next: (dataPackage) => {
        this.centroEspecialidades = dataPackage.data || [];
        // console.log('✅ Relaciones centro-especialidad cargadas (fallback):', this.centroEspecialidades.length);

        // Usar el método anterior como fallback
        this.extraerEspecialidadesDisponiblesFromService();
        this.procesarCentrosFromService();

        // Aplicar filtros
        this.aplicarFiltros();

        // Inicializar mapa
        setTimeout(() => this.inicializarMapa(), 100);
      },
      error: (error) => {
        console.error(
          "❌ Error cargando relaciones centro-especialidad:",
          error
        );
        this.especialidadesDisponibles = this.especialidades || [];
        this.procesarCentros();
        this.aplicarFiltros();
        setTimeout(() => this.inicializarMapa(), 100);
      },
    });
  }

  // Métodos fallback para cuando no hay slots
  extraerEspecialidadesDisponiblesFromService() {
    const especialidadesIds = new Set<number>();
    const centrosIds = new Set(
      this.centros.map((c) => c.id).filter((id) => id !== undefined)
    );

    this.centroEspecialidades.forEach((relacion) => {
      if (centrosIds.has(relacion.centroId)) {
        especialidadesIds.add(relacion.especialidadId);
      }
    });

    this.especialidadesDisponibles = this.especialidades.filter(
      (esp) => esp.id && especialidadesIds.has(esp.id)
    );
  }

  procesarCentrosFromService() {
    this.centrosFiltrados = this.centros.map((centro) => {
      const especialidadesCentro = this.centroEspecialidades
        .filter((relacion) => relacion.centroId === centro.id)
        .map((relacion) => {
          const especialidad = this.especialidades.find(
            (esp) => esp.id === relacion.especialidadId
          );
          return especialidad?.nombre || "Desconocida";
        })
        .filter((nombre) => nombre !== "Desconocida");

      return {
        ...centro,
        especialidadesDisponibles: especialidadesCentro,
      };
    });
  }

  extraerEspecialidadesDisponibles() {
    // Extraer especialidades únicas de los slots disponibles
    const especialidadesConTurnos = new Set<string>();

    // Solo considerar slots de centros que tenemos en la lista
    const centrosIds = new Set(
      this.centros.map((c) => c.id).filter((id) => id !== undefined)
    );

    this.slotsDisponibles.forEach((slot) => {
      if (
        centrosIds.has(Number(slot.centroId)) &&
        slot.especialidadStaffMedico &&
        slot.especialidadStaffMedico.trim()
      ) {
        especialidadesConTurnos.add(slot.especialidadStaffMedico.trim());
      }
    });

    // Filtrar especialidades del padre que realmente tienen turnos disponibles
    this.especialidadesDisponibles = this.especialidades.filter(
      (esp) => esp.nombre && especialidadesConTurnos.has(esp.nombre)
    );

    // console.log('✅ Especialidades con turnos disponibles en centros:', this.especialidadesDisponibles.length);
    // console.log('📋 Lista:', this.especialidadesDisponibles.map(e => e.nombre));
    // console.log('📋 Especialidades encontradas en slots:', Array.from(especialidadesConTurnos));
  }

  procesarCentros() {
    // console.log('🏥 Procesando centros con especialidades reales (basado en turnos disponibles)...');
    // console.log('- Centros recibidos:', this.centros.length);
    // console.log('- Slots disponibles recibidos:', this.slotsDisponibles.length);

    this.centrosFiltrados = this.centros.map((centro) => {
      // Buscar las especialidades que realmente tienen turnos disponibles en este centro
      const slotsDelCentro = this.slotsDisponibles.filter(
        (slot) => Number(slot.centroId) === Number(centro.id)
      );

      // Extraer especialidades únicas de los slots disponibles
      const especialidadesConTurnos = new Set<string>();
      slotsDelCentro.forEach((slot) => {
        if (
          slot.especialidadStaffMedico &&
          slot.especialidadStaffMedico.trim()
        ) {
          especialidadesConTurnos.add(slot.especialidadStaffMedico.trim());
        }
      });

      const especialidadesCentro = Array.from(especialidadesConTurnos);

      // if (centro.id === 1) { // Debug solo para el primer centro
      //   console.log(`🏥 Centro ${centro.nombre} (ID: ${centro.id}):`);
      //   console.log('  - Slots encontrados:', slotsDelCentro.length);
      //   console.log('  - Especialidades con turnos disponibles:', especialidadesCentro);
      // }

      return {
        ...centro,
        especialidadesDisponibles: especialidadesCentro,
      };
    });

    // console.log('✅ Centros procesados:', this.centrosFiltrados.length);
    // console.log('📊 Resumen de especialidades por centro (con turnos reales):');
    // this.centrosFiltrados.slice(0, 3).forEach(centro => {
    //   console.log(`  - ${centro.nombre}: ${centro.especialidadesDisponibles?.length || 0} especialidades con turnos`);
    // });
  }

  inicializarMapa() {
    if (!this.mapContainer?.nativeElement) {
      return;
    }

    // Evitar inicializar el mapa múltiples veces
    if (this.map) {
      console.log("🗺️ Mapa ya inicializado, solo actualizando marcadores...");
      this.agregarMarcadoresCentros();
      return;
    }

    console.log("🗺️ Inicializando mapa...");

    // Centrar en Argentina por defecto
    this.map = L.map(this.mapContainer.nativeElement).setView(
      [-34.6037, -58.3816],
      6
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.map);

    // Agregar marcadores de centros
    this.agregarMarcadoresCentros();
  }

  agregarMarcadoresCentros() {
    // Limpiar marcadores existentes
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];

    this.resultadosBusqueda.forEach((centro, index) => {
      if (centro.latitud && centro.longitud) {
        const marker = L.marker([centro.latitud, centro.longitud])
          .bindPopup(this.crearPopupCentro(centro, index + 1))
          .addTo(this.map);

        // No agregar evento click aquí - el popup se abre automáticamente
        // El modal solo se abrirá desde el botón del popup

        this.markers.push(marker);
      }
    });

    // Ajustar vista si hay centros
    if (this.resultadosBusqueda.length > 0) {
      const group = new L.FeatureGroup(this.markers);
      if (this.userMarker) {
        group.addLayer(this.userMarker);
      }
      this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }

  crearPopupCentro(centro: CentroMapaInfo, numero: number): string {
    const distancia =
      centro.distanciaKm !== undefined
        ? `<div class="popup-distance"><i class="fas fa-route"></i> ${this.formatDistance(
            centro.distanciaKm
          )}</div>`
        : "";

    // Obtener las especialidades reales del centro (mostrar solo 2 en el popup)
    const especialidadesCentro = centro.especialidadesDisponibles || [];
    const especialidadesPreview =
      especialidadesCentro.length > 0
        ? `<div class="popup-especialidades-preview">
           <i class="fas fa-stethoscope"></i> 
           ${especialidadesCentro.slice(0, 2).join(", ")}
           ${especialidadesCentro.length > 2 ? ` (+${especialidadesCentro.length - 2} más)` : ""}
         </div>`
        : "";

    return `
      <div class="centro-popup-compact">
        <div class="popup-header-compact">
          <span class="popup-number">${numero}</span>
          <div class="popup-title">
            <strong>${centro.nombre}</strong>
          </div>
        </div>
        <div class="popup-body-compact">
          <div class="popup-row-compact">
            <i class="fas fa-map-marker-alt"></i> 
            ${centro.direccion}
          </div>
          ${distancia}
          ${especialidadesPreview}
          <div class="popup-actions-compact">
            <button 
              class="btn-popup-compact btn-popup-primary" 
              onclick="window.centrosModalComponent.abrirModalInfoCentro(${centro.id})">
              <i class="fas fa-info-circle"></i> Ver más información
            </button>
          </div>
        </div>
      </div>
    `;
  }

  obtenerUbicacionUsuario() {
    this.isLoadingLocation = true;
    this.locationError = null;

    this.geolocationService
      .getCurrentLocation({
        timeout: 15000,
        enableHighAccuracy: true,
        useIPFallback: true,
      })
      .then((location) => {
        const wasLocated = this.userLocation !== null;
        this.userLocation = location;
        this.isLoadingLocation = false;
        this.mostrarUbicacionUsuarioEnMapa();
        this.calcularDistancias();
        this.aplicarFiltros();
        
        // Feedback visual cuando se actualiza la ubicación
        if (wasLocated) {
          console.log('🗺️ Ubicación actualizada exitosamente');
          // Hacer un pequeño efecto en el mapa centrándolo en la nueva ubicación
          if (this.map) {
            this.map.setView([location.latitude, location.longitude], 14, {
              animate: true,
              duration: 1
            });
          }
        }
      })
      .catch((error) => {
        this.isLoadingLocation = false;
        this.locationError = error.message || "No se pudo obtener la ubicación";
        console.error('❌ Error al obtener ubicación:', error);
      });
  }

  mostrarUbicacionUsuarioEnMapa() {
    if (!this.userLocation) return;

    // Remover marcador anterior si existe
    if (this.userMarker) {
      this.userMarker.remove();
    }

    // Crear icono personalizado para el usuario
    const userIcon = L.divIcon({
      html: '<i class="fas fa-user"></i>',
      iconSize: [30, 30],
      className: "user-location-marker",
    });

    this.userMarker = L.marker(
      [this.userLocation.latitude, this.userLocation.longitude],
      {
        icon: userIcon,
      }
    )
      .bindPopup("Tu ubicación")
      .addTo(this.map);

    // Centrar el mapa en la ubicación del usuario si es la primera vez
    if (this.userLocation.source === "geolocation") {
      this.map.setView(
        [this.userLocation.latitude, this.userLocation.longitude],
        12
      );
    }
  }

  buscarDireccion() {
    if (!this.direccionBusqueda.trim()) return;

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      this.direccionBusqueda
    )}&format=json&limit=1&countrycodes=ar`;

    this.http.get<any[]>(url).subscribe({
      next: (results) => {
        if (results.length > 0) {
          const { lat, lon } = results[0];
          this.latitudManual = parseFloat(lat);
          this.longitudManual = parseFloat(lon);
          this.establecerCoordenadas();
        } else {
          this.locationError = "No se encontró la dirección especificada";
        }
      },
      error: () => {
        this.locationError = "Error al buscar la dirección";
      },
    });
  }

  // MÉTODOS PARA MODO ARRASTRE
  toggleModoArrastre() {
    this.modoArrastre = !this.modoArrastre;
    
    if (this.modoArrastre) {
      this.activarModoArrastre();
    } else {
      this.desactivarModoArrastre();
    }
  }

  activarModoArrastre() {
    if (!this.map) return;
    
    // Ocultar el marcador del usuario existente
    if (this.userMarker) {
      this.userMarker.remove();
    }
    
    // Agregar event listener para cuando se mueve el mapa
    this.map.on('moveend', this.onMapMoveEnd.bind(this));
    
    // Activar el centro del mapa para obtener coordenadas
    this.actualizarUbicacionPorArrastre();
    
    console.log('🎯 Modo arrastre activado - Mueve el mapa para ajustar tu ubicación');
  }

  desactivarModoArrastre() {
    if (!this.map) return;
    
    // Remover event listener
    this.map.off('moveend', this.onMapMoveEnd.bind(this));
    
    // Mostrar nuevamente el marcador del usuario si existe
    if (this.userLocation) {
      this.mostrarUbicacionUsuarioEnMapa();
    }
    
    // AHORA SÍ RECALCULAR las distancias cuando se desactiva el modo arrastre
    this.calcularDistancias();
    this.aplicarFiltros();
    
    console.log('🎯 Modo arrastre desactivado - Distancias recalculadas');
  }

  onMapMoveEnd() {
    if (this.modoArrastre) {
      this.actualizarUbicacionPorArrastre();
    }
  }

  actualizarUbicacionPorArrastre() {
    if (!this.map) return;
    
    const center = this.map.getCenter();
    
    // Actualizar la ubicación del usuario con las coordenadas del centro
    this.userLocation = {
      latitude: center.lat,
      longitude: center.lng,
      accuracy: 0,
      source: 'manual',
      timestamp: Date.now()
    };
    
    // Recalcular distancias y filtros
    this.calcularDistancias();
    this.aplicarFiltros();
    
    console.log('📍 Ubicación actualizada por arrastre:', center.lat, center.lng);
  }

  calcularDistancias() {
    if (!this.userLocation) return;
    
    // SI ESTÁ EN MODO ARRASTRE, NO CALCULAR NADA
    if (this.modoArrastre) return;

    this.centrosFiltrados.forEach((centro) => {
      if (centro.latitud && centro.longitud) {
        centro.distanciaKm = this.geolocationService.calculateDistance(
          this.userLocation!.latitude,
          this.userLocation!.longitude,
          centro.latitud,
          centro.longitud
        );
      }
    });
  }

  aplicarFiltros() {
    // SI ESTÁ EN MODO ARRASTRE, NO APLICAR FILTROS
    if (this.modoArrastre) return;
    
    let centrosFiltrados = [...this.centrosFiltrados] as CentroMapaInfo[];

    // Filtrar por especialidad
    if (this.especialidadFiltro && this.especialidadFiltro.trim()) {
      centrosFiltrados = centrosFiltrados.filter((centro) => {
        if (
          !centro.especialidadesDisponibles ||
          centro.especialidadesDisponibles.length === 0
        ) {
          return false;
        }

        // Verificar si el centro tiene la especialidad seleccionada
        return centro.especialidadesDisponibles.some(
          (especialidadNombre) =>
            especialidadNombre &&
            especialidadNombre.toLowerCase() ===
              this.especialidadFiltro.toLowerCase()
        );
      });
    }

    // Filtrar por búsqueda de texto
    if (this.busquedaTexto && this.busquedaTexto.trim()) {
      const textoBusqueda = this.busquedaTexto.toLowerCase().trim();
      centrosFiltrados = centrosFiltrados.filter((centro) => {
        const nombreCentro = centro.nombre?.toLowerCase() || "";
        const direccionCentro = centro.direccion?.toLowerCase() || "";
        const localidadCentro = centro.localidad?.toLowerCase() || "";

        return (
          nombreCentro.includes(textoBusqueda) ||
          direccionCentro.includes(textoBusqueda) ||
          localidadCentro.includes(textoBusqueda)
        );
      });
    }

    // Filtrar por radio de distancia
    if (this.userLocation && this.radioMaximo > 0) {
      centrosFiltrados = centrosFiltrados.filter((centro) => {
        if (!centro.latitud || !centro.longitud) return false;

        const distancia = this.geolocationService.calculateDistance(
          this.userLocation!.latitude,
          this.userLocation!.longitude,
          centro.latitud,
          centro.longitud
        );

        centro.distanciaKm = distancia;
        return distancia <= this.radioMaximo;
      });
    } else if (this.userLocation) {
      // Calcular distancias aunque no haya límite
      centrosFiltrados.forEach((centro) => {
        if (centro.latitud && centro.longitud) {
          centro.distanciaKm = this.geolocationService.calculateDistance(
            this.userLocation!.latitude,
            this.userLocation!.longitude,
            centro.latitud,
            centro.longitud
          );
        }
      });
    }

    // SIEMPRE ordenar por distancia cuando hay ubicación del usuario
    if (this.userLocation) {
      centrosFiltrados.sort((a, b) => {
        const distanciaA = a.distanciaKm ?? Number.MAX_VALUE;
        const distanciaB = b.distanciaKm ?? Number.MAX_VALUE;
        return distanciaA - distanciaB;
      });
    }

    // Actualizar la lista de resultados para la lista Y para el mapa
    this.resultadosBusqueda = centrosFiltrados;
    this.centrosFiltrados = centrosFiltrados; // Para compatibilidad con el template

    // Limpiar cache de conteo al cambiar los centros filtrados
    this.conteoEspecialidadesCache.clear();

    // Actualizar marcadores en el mapa
    if (this.map) {
      this.agregarMarcadoresCentros();
    }
  }

  toggleOrdenarPorDistancia() {
    this.ordenadoPorDistancia = !this.ordenadoPorDistancia;
    this.aplicarFiltros();
  }

  seleccionarCentro(centro: CentroMapaInfo) {
    this.centroActualSeleccionado = centro;
    this.centroInfoModal = centro;
    this.mostrarModalInfoCentro = true;
    // No emitir el evento aquí, solo mostrar el modal
    // this.centroSeleccionado.emit(centro);
  }

  cerrarModalInfoCentro() {
    this.mostrarModalInfoCentro = false;
    this.centroInfoModal = null;
  }

  verTurnosCentro(centroId: number) {
    // Este método será llamado desde el HTML con routerLink
    // Solo cerrar los modales
    this.cerrarModalInfoCentro();
    this.close();
  }

  centrarEnMapa(centro: CentroMapaInfo, event: Event) {
    event.stopPropagation();

    if (centro.latitud && centro.longitud) {
      this.map.setView([centro.latitud, centro.longitud], 15);

      // Encontrar y abrir el popup del marcador
      const marker = this.markers.find((m) => {
        const pos = m.getLatLng();
        return pos.lat === centro.latitud && pos.lng === centro.longitud;
      });

      if (marker) {
        marker.openPopup();
      }
    }
  }

  ampliarRadio() {
    if (this.radioMaximo === 10) this.radioMaximo = 25;
    else if (this.radioMaximo === 25) this.radioMaximo = 50;
    else if (this.radioMaximo === 50) this.radioMaximo = 100;
    else if (this.radioMaximo === 100) this.radioMaximo = 0;

    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.especialidadFiltro = "";
    this.radioMaximo = 50;
    this.aplicarFiltros();
  }

  formatDistance(distance: number): string {
    return this.geolocationService.formatDistance(distance);
  }

  // ================================
  // GESTIÓN DE ESTADOS DEL MAPA
  // ================================

  confirmarUbicacion() {
    console.log('🎯 Confirmando ubicación y cambiando a modo compacto...');
    
    this.ubicacionConfirmada = true;
    this.modoExploracion = false;
    
    // Asegurar que la lista esté ordenada por distancia
    if (this.userLocation && !this.ordenadoPorDistancia) {
      this.toggleOrdenarPorDistancia();
    }

    // Redimensionar el mapa después de la transición CSS
    setTimeout(() => {
      if (this.map) {
        console.log('📐 Redimensionando mapa para modo compacto...');
        this.map.invalidateSize();
      }
    }, 450); // Ligeramente más que la transición CSS (0.4s)
  }

  volverModoExploracion() {
    console.log('🗺️ Volviendo a modo exploración...');
    
    this.modoExploracion = true;
    
    // Redimensionar el mapa después de la transición CSS
    setTimeout(() => {
      if (this.map) {
        console.log('📐 Redimensionando mapa para modo exploración...');
        this.map.invalidateSize();
      }
    }, 450);
  }

  close() {
    this.modalCerrado.emit();
  }

  // Método público llamado desde el popup de Leaflet
  abrirModalInfoCentro(centroId: number) {
    const centro = this.centrosFiltrados.find((c) => c.id === centroId);
    if (centro) {
      this.seleccionarCentro(centro);
    }
  }

  // ================================
  // FUNCIONALIDADES DE BÚSQUEDA
  // ================================

  // Buscar centros por texto (para autocompletado)
  buscarCentros() {
    const texto = this.busquedaTexto.toLowerCase().trim();

    if (texto.length === 0) {
      this.resultadosBusqueda = [];
      // Aplicar filtros normales cuando no hay búsqueda
      this.aplicarFiltros();
      return;
    }

    if (texto.length < 2) {
      return; // Esperar al menos 2 caracteres
    }

    // Crear resultados de autocompletado (máximo 5)
    this.resultadosBusqueda = this.centrosFiltrados
      .filter(
        (centro) =>
          centro.nombre.toLowerCase().includes(texto) ||
          centro.direccion?.toLowerCase().includes(texto) ||
          centro.localidad?.toLowerCase().includes(texto) ||
          centro.provincia?.toLowerCase().includes(texto)
      )
      .slice(0, 5);

    // También aplicar filtros a la lista principal
    this.aplicarFiltros();
  }

  // Limpiar búsqueda
  limpiarBusqueda() {
    this.busquedaTexto = "";
    this.resultadosBusqueda = [];
    // Volver a aplicar filtros sin búsqueda de texto
    this.aplicarFiltros();
  }

  // Seleccionar centro desde los resultados de búsqueda
  seleccionarCentroEnMapa(centro: CentroMapaInfo) {
    this.limpiarBusqueda();

    // Marcar el centro como seleccionado
    this.centroActualSeleccionado = centro;

    if (centro.latitud && centro.longitud) {
      // Centrar el mapa en el centro
      this.map.setView([centro.latitud, centro.longitud], 16);

      // Encontrar el marcador correspondiente y abrir su popup
      const marker = this.markers.find((m) => {
        const markerLatLng = m.getLatLng();
        return (
          Math.abs(markerLatLng.lat - centro.latitud!) < 0.0001 &&
          Math.abs(markerLatLng.lng - centro.longitud!) < 0.0001
        );
      });

      if (marker) {
        marker.openPopup();
      }
    }
  }

  // Contar centros por especialidad (con cache)
  contarCentrosPorEspecialidad(especialidad: string): number {
    // Verificar si necesitamos recalcular el cache
    if (this.centrosFiltrados.length !== this.lastCentrosFiltradosLength) {
      this.conteoEspecialidadesCache.clear();
      this.lastCentrosFiltradosLength = this.centrosFiltrados.length;
    }

    // Verificar si ya tenemos el resultado en cache
    if (this.conteoEspecialidadesCache.has(especialidad)) {
      return this.conteoEspecialidadesCache.get(especialidad)!;
    }

    // Calcular el conteo
    const centrosConEspecialidad = this.centrosFiltrados.filter((centro) => {
      // Verificar si el centro tiene la especialidad disponible
      const tieneEspecialidad =
        centro.especialidadesDisponibles &&
        centro.especialidadesDisponibles.some(
          (esp) => esp && esp.toLowerCase() === especialidad.toLowerCase()
        );
      return tieneEspecialidad;
    });

    const conteo = centrosConEspecialidad.length;

    // Guardar en cache
    this.conteoEspecialidadesCache.set(especialidad, conteo);

    // Debug solo una vez por especialidad (comentado - problema resuelto)
    // if (especialidad === 'Medicina General' || especialidad.toLowerCase().includes('ginecol')) {
    //   console.log(`🔍 Contando centros para "${especialidad}" (calculado):`);
    //   console.log('  - Centros filtrados totales:', this.centrosFiltrados.length);
    //   console.log('  - Centros con la especialidad:', conteo);
    //   console.log('  - Centros encontrados:', centrosConEspecialidad.map(c => ({
    //     nombre: c.nombre,
    //     especialidades: c.especialidadesDisponibles
    //   })));
    // }

    return conteo;
  }

  // ================================
  // FUNCIONALIDADES DE UBICACIÓN MANUAL
  // ================================

  // Establecer coordenadas manualmente
  establecerCoordenadas() {
    if (!this.latitudManual || !this.longitudManual) {
      this.locationError = "Por favor ingresa latitud y longitud válidas.";
      return;
    }

    const lat = this.latitudManual;
    const lng = this.longitudManual;

    // Validar rango de coordenadas para Argentina aproximadamente
    if (lat < -55 || lat > -21 || lng < -74 || lng > -53) {
      this.locationError =
        "Las coordenadas parecen estar fuera de Argentina. ¿Están correctas?";
    }

    this.userLocation = {
      latitude: lat,
      longitude: lng,
      accuracy: 0,
      source: "manual",
      timestamp: Date.now(),
    };

    this.locationError = null;
    this.showManualLocationForm = false;

    // Actualizar el mapa
    this.mostrarUbicacionUsuarioEnMapa();
    this.calcularDistancias();
    this.aplicarFiltros();
  }
}
