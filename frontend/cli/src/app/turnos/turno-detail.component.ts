import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { TurnoService } from "./turno.service";
import { Turno, AuditLog } from "./turno";
import { DataPackage } from "../data.package";
import { PacienteService } from "../pacientes/paciente.service";
import { StaffMedicoService } from "../staffMedicos/staffMedico.service";
import { ConsultorioService } from "../consultorios/consultorio.service";
import { Paciente } from "../pacientes/paciente";
import { StaffMedico } from "../staffMedicos/staffMedico";
import { Consultorio } from "../consultorios/consultorio";
import { ModalService } from "../modal/modal.service";

@Component({
  selector: "app-turno-detail",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./turno-detail.component.html",
  styleUrl: "./turno-detail.component.css",
})
export class TurnoDetailComponent {
  turno: Turno = {
    id: 0,
    fecha: "",
    horaInicio: "",
    horaFin: "",
    estado: "PROGRAMADO",
    pacienteId: 0,
    staffMedicoId: 0,
    consultorioId: 0,
  };

  modoEdicion = false;
  pacientes: Paciente[] = [];
  staffMedicos: StaffMedico[] = [];
  consultorios: Consultorio[] = [];

  // === PROPIEDADES DE AUDITORÍA ===
  auditHistory: AuditLog[] = [];
  showAuditPanel = false;
  loadingAudit = false;
  auditIntegrityValid = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private turnoService: TurnoService,
    private pacienteService: PacienteService,
    private staffMedicoService: StaffMedicoService,
    private consultorioService: ConsultorioService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.loadDropdownData();
    this.get();
  }

  get(): void {
    const path = this.route.snapshot.routeConfig?.path;

    if (path === "turnos/new") {
      // Nuevo turno
      this.modoEdicion = true;
      this.turno = {
        id: 0,
        fecha: "",
        horaInicio: "",
        horaFin: "",
        estado: "PROGRAMADO",
        pacienteId: 0,
        staffMedicoId: 0,
        consultorioId: 0,
      } as Turno;
    } else if (path === "turnos/:id") {
      // Detalle o edición
      this.modoEdicion =
        this.route.snapshot.queryParamMap.get("edit") === "true";
      const idParam = this.route.snapshot.paramMap.get("id");
      if (!idParam) return;

      const id = Number(idParam);
      if (isNaN(id)) {
        console.error("El ID proporcionado no es un número válido.");
        return;
      }

      this.turnoService.get(id).subscribe({
        next: (dataPackage) => {
          this.turno = <Turno>dataPackage.data;
        },
        error: (err) => {
          console.error("Error al obtener el turno:", err);
        },
      });
    }
  }

  loadDropdownData(): void {
    // Cargar pacientes
    this.pacienteService
      .all()
      .subscribe((dataPackage: DataPackage<Paciente[]>) => {
        this.pacientes = dataPackage.data || [];
      });

    // Cargar staff médicos
    this.staffMedicoService
      .all()
      .subscribe((dataPackage: DataPackage<StaffMedico[]>) => {
        this.staffMedicos = dataPackage.data || [];
      });

    // Cargar consultorios
    this.consultorioService
      .getAll()
      .subscribe((dataPackage: DataPackage<Consultorio[]>) => {
        this.consultorios = dataPackage.data || [];
      });
  }

  save(): void {
    console.log("Valores antes de guardar:", {
      pacienteId: this.turno.pacienteId,
      staffMedicoId: this.turno.staffMedicoId,
      consultorioId: this.turno.consultorioId,
    });
    if (
      !this.isValidId(this.turno.pacienteId) ||
      !this.isValidId(this.turno.staffMedicoId) ||
      !this.isValidId(this.turno.consultorioId)
    ) {
      this.modalService.alert(
        "Error",
        "Debe completar todos los campos obligatorios."
      );
      return;
    }

    const op = this.turno.id
      ? this.turnoService.update(this.turno.id, this.turno)
      : this.turnoService.create(this.turno);

    op.subscribe({
      next: () => this.router.navigate(["/turnos"]),
      error: (error) => {
        console.error("Error al guardar el turno:", error);
        this.modalService.alert("Error", "No se pudo guardar el turno.");
      },
    });
  }
  private isValidId(id: any): boolean {
    // Un ID es válido si no es null, undefined, string vacío, pero SÍ acepta 0
    return id != null && id !== "";
  }
  goBack(): void {
    this.router.navigate(["/turnos"]);
  }

  cancelar(): void {
    if (this.turno.id) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        queryParamsHandling: "merge",
      });
      this.modoEdicion = false;
    } else {
      this.goBack();
    }
  }

  activarEdicion(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { edit: true },
      queryParamsHandling: "merge",
    });
    this.modoEdicion = true;
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado?.toUpperCase()) {
      case "PROGRAMADO":
        return "estado-display estado-programado";
      case "CONFIRMADO":
        return "estado-display estado-confirmado";
      case "REAGENDADO":
        return "estado-display estado-reagendado";
      case "CANCELADO":
        return "estado-display estado-cancelado";
      default:
        return "estado-display bg-secondary";
    }
  }

  remove(turno: Turno): void {
    if (turno.id === undefined) {
      this.modalService.alert(
        "Error",
        "No se puede eliminar: el turno no tiene ID."
      );
      return;
    }
    this.modalService
      .confirm(
        "Eliminar Turno",
        "¿Está seguro que desea eliminar este turno?",
        "Si elimina el turno no lo podrá utilizar luego"
      )
      .then(() => {
        this.turnoService.remove(turno.id!).subscribe({
          next: () => {
            this.goBack();
          },
          error: (err) => {
            console.error("Error al eliminar el turno:", err);
            this.modalService.alert(
              "Error",
              "No se pudo eliminar el turno. Intente nuevamente."
            );
          },
        });
      });
  }

  allFieldsEmpty(): boolean {
    return (
      !this.turno?.pacienteId &&
      !this.turno?.staffMedicoId &&
      !this.turno?.consultorioId
    );
  }

  // === MÉTODOS DE AUDITORÍA ===

  /** Carga el historial de auditoría del turno */
  loadAuditHistory(): void {
    if (!this.turno.id) return;

    this.loadingAudit = true;
    this.turnoService.getAuditHistory(this.turno.id).subscribe({
      next: (response: DataPackage<AuditLog[]>) => {
        if (response.status === 1) {
          this.auditHistory = response.data || [];
        }
        this.loadingAudit = false;
      },
      error: (error) => {
        console.error("Error al cargar historial:", error);
        this.loadingAudit = false;
      },
    });
  }

  /** Muestra/oculta el panel de auditoría */
  toggleAuditPanel(): void {
    this.showAuditPanel = !this.showAuditPanel;
    if (this.showAuditPanel && this.auditHistory.length === 0) {
      this.loadAuditHistory();
    }
  }

  /** Verifica la integridad del historial de auditoría */
  verifyAuditIntegrity(): void {
    if (!this.turno.id) return;

    this.turnoService.verifyAuditIntegrity(this.turno.id).subscribe({
      next: (response: DataPackage<{ isValid: boolean }>) => {
        if (response.status === 1) {
          this.auditIntegrityValid = response.data.isValid;
          const message = this.auditIntegrityValid
            ? "El historial de auditoría es íntegro y válido"
            : "Se detectaron inconsistencias en el historial de auditoría";
          this.modalService.alert("Verificación de Integridad", message);
        }
      },
      error: (error) => {
        console.error("Error al verificar integridad:", error);
        this.modalService.alert(
          "Error",
          "No se pudo verificar la integridad del historial"
        );
      },
    });
  }

  /** Formatea una fecha y hora para mostrar */
  formatDateTime(dateTimeString: string): string {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    return date.toLocaleString("es-ES");
  }

  /** Obtiene la clase CSS para el tipo de acción de auditoría */
  getActionClass(action: string): string {
    const classes: any = {
      CREATED: "badge bg-info",
      STATUS_CHANGED: "badge bg-primary",
      CANCELED: "badge bg-danger",
      CONFIRMED: "badge bg-success",
      RESCHEDULED: "badge bg-warning",
      DELETED: "badge bg-dark",
    };
    return classes[action] || "badge bg-secondary";
  }

  /** Obtiene el icono para el tipo de acción */
  getActionIcon(action: string): string {
    const icons: any = {
      CREATED: "fas fa-plus-circle",
      STATUS_CHANGED: "fas fa-edit",
      CANCELED: "fas fa-times-circle",
      CONFIRMED: "fas fa-check-circle",
      RESCHEDULED: "fas fa-calendar-alt",
      DELETED: "fas fa-trash",
    };
    return icons[action] || "fas fa-question-circle";
  }
}
