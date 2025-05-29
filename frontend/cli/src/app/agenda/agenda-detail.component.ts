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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private agendaService: AgendaService,
    private location: Location
  ) {}

  ngOnInit() {
    this.get();
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
}