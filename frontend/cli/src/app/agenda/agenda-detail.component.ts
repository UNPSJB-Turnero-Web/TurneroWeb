import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AgendaService } from "./agenda.service";
import { Agenda, Dia, Slot } from "./agenda";
import { Location, CommonModule } from "@angular/common";

@Component({
  selector: "app-agenda-detail",
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'agenda-detail.component.html',
  styles: ``,
})
export class AgendaDetailComponent implements OnInit {
  agenda!: Agenda | null;
  diaSeleccionado!: Dia | null;
  slotSeleccionado!: Slot | null;
   slot: Slot | null = null;
   evento: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private agendaService: AgendaService,
    private location: Location
  ) {}

 ngOnInit(): void {
  const navigation = this.router.getCurrentNavigation();
  const state = navigation?.extras.state as { evento: any };
  if (state?.evento) {
    this.evento = state.evento;
  } else {
    console.error('No se encontraron datos del evento.');
  }
}

  get() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.agendaService.get(+id).subscribe((dataPackage) => {
        this.agenda = dataPackage.data as Agenda;
      });
    }
  }

  goBack() {
    this.location.back();
  }

  seleccionarDia(dia: Dia) {
    this.diaSeleccionado = dia;
    this.slotSeleccionado = null;
  }

  seleccionarSlot(slot: Slot) {
    this.slotSeleccionado = slot;
  }

  asignarTurno(): void {
    if (!this.agenda) {
      alert('No se puede asignar un turno porque no hay datos del evento.');
      return;
    }

    const pacienteId = prompt('Ingrese el ID del paciente:'); // Solicitar el ID del paciente
    if (pacienteId) {
      this.agendaService.asignarTurno(this.agenda.id, +pacienteId).subscribe({
        next: () => {
          alert('Turno asignado correctamente.');
          this.router.navigate(['/agenda']); // Redirigir a la agenda
        },
        error: (err) => {
          console.error('Error al asignar el turno:', err);
          alert('No se pudo asignar el turno. Intente nuevamente.');
        },
      });
    }
  }

  handleEvent(eventObj: any): void {
    const evento = eventObj.event;
    this.router.navigate(['/agenda-detail'], { state: { evento } });
  }
}

