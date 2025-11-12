import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EncuestaAdminService } from '../../services/encuesta-admin.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';

interface TipoPregunta {
  value: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-gestion-encuestas',
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-encuestas.component.html',
  styleUrls: ['./gestion-encuestas.component.css']
})
export class GestionEncuestasComponent implements OnInit {
  preguntas: any[] = [];
  plantillas: any[] = [];
  loading = false;


  // Datos para crear/editar pregunta
  nuevaPreguntaTexto = '';
  nuevaPreguntaTipo = 'TEXTO_LIBRE';
  editandoPreguntaId: number | null = null;

  // Datos para crear/editar plantilla
  nuevaPlantillaNombre = '';
  editandoPlantillaId: number | null = null;

  // Tipos de pregunta disponibles
  tiposDisponibles: TipoPregunta[] = [
    { value: 'NPS', label: 'NPS (Net Promoter Score)', description: 'Escala 0-10' },
    { value: 'RATING_ESPERA', label: 'Rating - Tiempo de Espera', description: 'Escala 1-5' },
    { value: 'RATING_TRATO', label: 'Rating - Trato Recibido', description: 'Escala 1-5' },
    { value: 'CSAT', label: 'CSAT (Customer Satisfaction)', description: 'Escala 1-5' },
    { value: 'TEXTO_LIBRE', label: 'Texto Libre', description: 'Respuesta abierta' }
  ];

  // Selección
  selectedPreguntaIds: number[] = [];
  selectedPlantillaId: number | null = null;

  // Búsqueda para asignación
  selectedCentro: any = null;  // Cambiado: objeto en vez de ID
  selectedEspecialidad: any = null;  // Cambiado: objeto en vez de ID
  searchCentro: string = '';
  searchEspecialidad: string = '';

  // Nuevo: propiedades para resultados filtrados (ya no getters)
  centrosFiltrados: any[] = [];
  especialidadesFiltradas: any[] = [];

  // Nuevo: Subjects para debouncing
  private searchTermsCentro = new Subject<string>();
  private searchTermsEspecialidad = new Subject<string>();
  // Preview
  showPreview = false;
  previewPlantilla: any = null;
  previewRespuestas: { [preguntaId: number]: any } = {};

  constructor(private adminService: EncuestaAdminService) { }

  ngOnInit(): void {
    this.reload();
    // Configurar debouncing para centros
    this.searchTermsCentro.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => this.adminService.buscarCentrosPorNombre(term))
    ).subscribe(response => {
      this.centrosFiltrados = response.data || [];  // Extrae data (ajusta si el formato es diferente)
    });

    // Configurar debouncing para especialidades
    this.searchTermsEspecialidad.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => this.adminService.buscarEspecialidadesPorNombre(term))
    ).subscribe(response => {
      this.especialidadesFiltradas = response.data || [];  // Extrae data
    });
  }

  // Nuevo: métodos para trigger búsqueda en (ngModelChange)
  onSearchCentro(term: string) {
    this.selectedCentro = null;  // Reset seleccionado (como en tu (input))
    if (term.trim().length >= 2) {  // Min length para evitar requests innecesarios
      this.searchTermsCentro.next(term);
    } else {
      this.centrosFiltrados = [];  // Limpia lista si término corto
    }
  }

  onSearchEspecialidad(term: string) {
    this.selectedEspecialidad = null;
    if (term.trim().length >= 2) {
      this.searchTermsEspecialidad.next(term);
    } else {
      this.especialidadesFiltradas = [];
    }

  }

  reload() {
    this.loading = true;
    this.adminService.listarPreguntas().subscribe({
      next: (res) => {
        this.preguntas = (res && res.data) ? res.data : res;
        console.log('📋 Preguntas cargadas:', this.preguntas);
      },
      error: (err) => console.error('❌ Error cargando preguntas:', err)
    });

    this.adminService.listarPlantillas().subscribe({
      next: (res) => {
        this.plantillas = (res && res.data) ? res.data : res;
        console.log('📋 Plantillas cargadas:', this.plantillas);
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error cargando plantillas:', err);
        this.loading = false;
      }
    });
  }

  // cargarCatalogos() {
  //   // Cargar centros de atención
  //   this.adminService.listarCentrosAtencion().subscribe({
  //     next: (res) => {
  //       this.centrosAtencion = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
  //       console.log('🏥 Centros de atención cargados:', this.centrosAtencion);
  //     },
  //     error: (err) => {
  //       console.error('❌ Error cargando centros:', err);
  //       this.centrosAtencion = [];
  //     }
  //   });

  //   // Cargar especialidades
  //   this.adminService.listarEspecialidades().subscribe({
  //     next: (res) => {
  //       this.especialidades = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
  //       console.log('🩺 Especialidades cargadas:', this.especialidades);
  //     },
  //     error: (err) => {
  //       console.error('❌ Error cargando especialidades:', err);
  //       this.especialidades = [];
  //     }
  //   });
  // }

  // // Filtrado de centros y especialidades
  // get centrosFiltrados() {
  //   if (!this.searchCentro.trim()) {
  //     return this.centrosAtencion;
  //   }
  //   const search = this.searchCentro.toLowerCase();
  //   return this.centrosAtencion.filter(c =>
  //     c.nombre?.toLowerCase().includes(search) ||
  //     c.direccion?.toLowerCase().includes(search)
  //   );
  // }

  // get especialidadesFiltradas() {
  //   if (!this.searchEspecialidad.trim()) {
  //     return this.especialidades;
  //   }
  //   const search = this.searchEspecialidad.toLowerCase();
  //   return this.especialidades.filter(e =>
  //     e.nombre?.toLowerCase().includes(search)
  //   );
  // }

  // === PREGUNTA CRUD ===

  crearPregunta() {
    if (!this.nuevaPreguntaTexto.trim()) {
      alert('⚠️ Por favor ingrese el texto de la pregunta');
      return;
    }

    const payload = {
      textoPregunta: this.nuevaPreguntaTexto.trim(),
      tipo: this.nuevaPreguntaTipo
    };

    if (this.editandoPreguntaId) {
      console.log('📝 Actualizando pregunta:', this.editandoPreguntaId, payload);
      this.adminService.actualizarPregunta(this.editandoPreguntaId, payload).subscribe({
        next: () => {
          alert('✅ Pregunta actualizada exitosamente');
          this.cancelarEdicionPregunta();
          this.reload();
        },
        error: (err) => {
          console.error('❌ Error actualizando pregunta:', err);
          alert('❌ Error al actualizar la pregunta');
        }
      });
    } else {
      console.log('📝 Creando pregunta:', payload);
      this.adminService.crearPregunta(payload).subscribe({
        next: () => {
          alert('✅ Pregunta creada exitosamente');
          this.nuevaPreguntaTexto = '';
          this.nuevaPreguntaTipo = 'TEXTO_LIBRE';
          this.reload();
        },
        error: (err) => {
          console.error('❌ Error creando pregunta:', err);
          alert('❌ Error al crear la pregunta');
        }
      });
    }
  }

  editarPregunta(p: any) {
    this.editandoPreguntaId = p.id;
    this.nuevaPreguntaTexto = p.textoPregunta;
    this.nuevaPreguntaTipo = p.tipo;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicionPregunta() {
    this.editandoPreguntaId = null;
    this.nuevaPreguntaTexto = '';
    this.nuevaPreguntaTipo = 'TEXTO_LIBRE';
  }

  eliminarPregunta(p: any) {
    if (!confirm(`¿Está seguro de eliminar la pregunta "${p.textoPregunta}"?`)) {
      return;
    }

    console.log('🗑️ Eliminando pregunta:', p.id);
    this.adminService.eliminarPregunta(p.id).subscribe({
      next: () => {
        alert('✅ Pregunta eliminada exitosamente');
        this.reload();
      },
      error: (err) => {
        console.error('❌ Error eliminando pregunta:', err);
        alert('❌ Error al eliminar la pregunta. Puede que esté siendo usada en una plantilla.');
      }
    });
  }

  // === PLANTILLA CRUD ===

  crearPlantilla() {
    if (!this.nuevaPlantillaNombre.trim()) {
      alert('⚠️ Por favor ingrese el nombre de la plantilla');
      return;
    }

    const payload = { nombre: this.nuevaPlantillaNombre.trim() };

    if (this.editandoPlantillaId) {
      console.log('📝 Actualizando plantilla:', this.editandoPlantillaId, payload);
      this.adminService.actualizarPlantilla(this.editandoPlantillaId, payload).subscribe({
        next: () => {
          alert('✅ Plantilla actualizada exitosamente');
          this.cancelarEdicionPlantilla();
          this.reload();
        },
        error: (err) => {
          console.error('❌ Error actualizando plantilla:', err);
          alert('❌ Error al actualizar la plantilla');
        }
      });
    } else {
      console.log('📝 Creando plantilla:', payload);
      this.adminService.crearPlantilla(payload).subscribe({
        next: () => {
          alert('✅ Plantilla creada exitosamente');
          this.nuevaPlantillaNombre = '';
          this.reload();
        },
        error: (err) => {
          console.error('❌ Error creando plantilla:', err);
          alert('❌ Error al crear la plantilla');
        }
      });
    }
  }

  editarPlantilla(pl: any) {
    this.editandoPlantillaId = pl.id;
    this.nuevaPlantillaNombre = pl.nombre;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicionPlantilla() {
    this.editandoPlantillaId = null;
    this.nuevaPlantillaNombre = '';
  }

  eliminarPlantilla(pl: any) {
    if (!confirm(`¿Está seguro de eliminar la plantilla "${pl.nombre}"?`)) {
      return;
    }

    console.log('🗑️ Eliminando plantilla:', pl.id);
    this.adminService.eliminarPlantilla(pl.id).subscribe({
      next: () => {
        alert('✅ Plantilla eliminada exitosamente');
        this.reload();
      },
      error: (err) => {
        console.error('❌ Error eliminando plantilla:', err);
        alert('❌ Error al eliminar la plantilla');
      }
    });
  }

  removerPreguntaPlantilla(plantillaId: number, preguntaId: number, preguntaTexto: string) {
    if (!confirm(`¿Remover la pregunta "${preguntaTexto}" de esta plantilla?`)) {
      return;
    }

    this.adminService.removerPreguntaDePlantilla(plantillaId, preguntaId).subscribe({
      next: () => {
        alert('✅ Pregunta removida de la plantilla');
        this.reload();
      },
      error: (err) => {
        console.error('❌ Error removiendo pregunta:', err);
        alert('❌ Error al remover la pregunta');
      }
    });
  }

  // === SELECCIÓN Y ASIGNACIÓN ===

  togglePreguntaSeleccion(p: any) {
    const id = p.id;
    const idx = this.selectedPreguntaIds.indexOf(id);
    if (idx === -1) {
      this.selectedPreguntaIds.push(id);
    } else {
      this.selectedPreguntaIds.splice(idx, 1);
    }
  }

  agregarPreguntasSeleccionadas() {
    if (!this.selectedPlantillaId) {
      alert('⚠️ Seleccione una plantilla primero');
      return;
    }

    if (this.selectedPreguntaIds.length === 0) {
      alert('⚠️ Seleccione al menos una pregunta');
      return;
    }

    const ops = this.selectedPreguntaIds.map(pid =>
      this.adminService.agregarPreguntaAPlantilla(this.selectedPlantillaId!, pid).toPromise()
    );

    Promise.all(ops).then(() => {
      alert('✅ Preguntas agregadas exitosamente');
      this.selectedPreguntaIds = [];
      this.reload();
    }).catch(err => {
      console.error('❌ Error:', err);
      alert('❌ Error al agregar preguntas');
    });
  }
  seleccionarCentro(centro: any) {
    this.selectedCentro = centro;
    this.searchCentro = '';  // Limpia búsqueda
    console.log('🏥 Centro seleccionado:', centro);
    console.log('Nombre del centro:', centro?.nombre);
  }

  seleccionarEspecialidad(especialidad: any) {
    this.selectedEspecialidad = especialidad;
    this.searchEspecialidad = '';
    console.log('🩺 Especialidad seleccionada:', especialidad);
  }
  asignarCentro() {
    if (!this.selectedPlantillaId || !this.selectedCentro) {
      alert('⚠️ Seleccione una plantilla y un centro');
      return;
    }
    console.log(`📝 Asignando plantilla ${this.selectedPlantillaId} a centro ${this.selectedCentro.id}`);
    this.adminService.asignarPlantillaACentro(this.selectedPlantillaId, this.selectedCentro.id).subscribe({
      next: () => {
        alert('✅ Centro asignado exitosamente');
        this.selectedCentro = null;
        this.reload();
      },
      error: () => alert('❌ Error al asignar centro')
    });
  }

  asignarEspecialidad() {
    if (!this.selectedPlantillaId || !this.selectedEspecialidad) {
      alert('⚠️ Seleccione una plantilla y una especialidad');
      return;
    }
    console.log(`📝 Asignando plantilla ${this.selectedPlantillaId} a especialidad ${this.selectedEspecialidad.id}`);
    this.adminService.asignarPlantillaAEspecialidad(this.selectedPlantillaId, this.selectedEspecialidad.id).subscribe({
      next: () => {
        alert('✅ Especialidad asignada exitosamente');
        this.selectedEspecialidad = null;
        this.reload();
      },
      error: () => alert('❌ Error al asignar especialidad')
    });
  }

  desasignarPlantilla() {
    if (!this.selectedPlantillaId) {
      alert('⚠️ Seleccione una plantilla');
      return;
    }

    this.adminService.desasignarPlantilla(this.selectedPlantillaId).subscribe({
      next: () => {
        alert('✅ Plantilla desasignada');
        this.reload();
      },
      error: () => alert('❌ Error al desasignar')
    });
  }

  // getCentroNombre(centroId: number): string {
  //   const centro = this.centrosAtencion.find(c => c.id === centroId);
  //   return centro ? centro.nombre : `Centro ${centroId}`;
  // }

  // getEspecialidadNombre(espId: number): string {
  //   const esp = this.especialidades.find(e => e.id === espId);
  //   return esp ? esp.nombre : `Especialidad ${espId}`;
  // }

  // === PREVIEW ===

  abrirPreview(pl: any) {
    this.previewPlantilla = pl;
    this.previewRespuestas = {};

    if (pl.preguntas) {
      pl.preguntas.forEach((p: any) => {
        this.previewRespuestas[p.id] = null;
      });
    }

    this.showPreview = true;
    console.log('👁️ Preview de plantilla:', pl);
  }

  cerrarPreview() {
    this.showPreview = false;
    this.previewPlantilla = null;
    this.previewRespuestas = {};
  }

  tipoEsNumerico(tipo: string): boolean {
    if (!tipo) return false;
    const tiposNumericos = ['NPS', 'RATING_ESPERA', 'RATING_TRATO', 'CSAT', 'RATING'];
    return tiposNumericos.includes(tipo.toUpperCase()) || tipo.toUpperCase().startsWith('RATING');
  }

  getTipoLabel(tipo: string): string {
    const tipoObj = this.tiposDisponibles.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  }
}