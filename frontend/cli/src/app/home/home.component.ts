import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { PacienteService } from "../pacientes/paciente.service";
import { Paciente } from "../pacientes/paciente";
import { MedicoService } from "../medicos/medico.service";

@Component({
  selector: "app-home",
  imports: [CommonModule, FormsModule],
  templateUrl: "./home.html",
  styleUrl: "./home.css",
})
export class HomeComponent {
  selectedRole: "admin" | "medico" | "patient" | "operador" | null = null;
  isLoading = false;
  isRegistering = false;
  errorMessage = "";
  showRegistrationPrompt = false;
  showRegistrationForm = false;
  obrasSociales: any[] = [];

  adminCredentials = {
    username: "",
    password: "",
  };

  medicoCredentials = {
    matricula: "",
  };

  patientCredentials = {
    dni: "",
  };

  registrationData = {
    dni: "",
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    fechaNacimiento: "",
    obraSocialId: "",
  };
  operadorCredentials = {
    username: "",
    email: "",
    password: "",
  };

  constructor(
    private router: Router,
    private pacienteService: PacienteService,
    private medicoService: MedicoService
  ) {
    this.loadObrasSociales();
  }

  selectRole(role: "admin" | "medico" | "patient" | "operador") {
    this.selectedRole = role;
    this.errorMessage = "";
    this.showRegistrationPrompt = false;
  }

  goBack() {
    this.selectedRole = null;
    this.errorMessage = "";
    this.showRegistrationPrompt = false;
    this.showRegistrationForm = false;
    this.adminCredentials = { username: "", password: "" };
    this.medicoCredentials = { matricula: "" };
    this.patientCredentials = { dni: "" };
    this.resetRegistrationData();
  }

  async loginAdmin() {
    this.isLoading = true;
    this.errorMessage = "";

    try {
      // Simular breve delay para mostrar loading
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Acceso directo para desarrollo
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("userName", "Administrador");
      this.router.navigate(["/turnos"]);
    } catch (error) {
      this.errorMessage = "Error al acceder al sistema";
    } finally {
      this.isLoading = false;
    }
  }

  async loginMedico() {
    this.isLoading = true;
    this.errorMessage = "";

    try {
      const matricula = this.medicoCredentials.matricula;

      // Validar formato de matrícula
      const matriculaRegex = /^[0-9]{5}-[0-9]$/;
      if (!matriculaRegex.test(matricula)) {
        this.errorMessage =
          "Por favor ingresa una matrícula válida (formato: 12345-6)";
        this.isLoading = false;
        return;
      }

      // Buscar médico por matrícula usando API
      this.medicoService.findByMatricula(matricula).subscribe({
        next: (response) => {
          if (response && response.data) {
            const medicoData = response.data;

            // Guardar datos del médico en localStorage
            localStorage.setItem("userRole", "medico");
            localStorage.setItem("medicoMatricula", matricula);
            localStorage.setItem("medicoData", JSON.stringify(medicoData));
            localStorage.setItem("medicoId", medicoData.id.toString());
            localStorage.setItem(
              "userName",
              `${medicoData.nombre} ${medicoData.apellido}`
            );

            this.isLoading = false;
            this.router.navigate(["/medico-dashboard"]);
          } else {
            this.errorMessage = "Matrícula no encontrada en el sistema";
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error("Error al validar matrícula:", error);
          this.errorMessage = "Matrícula no encontrada o error del servidor";
          this.isLoading = false;
        },
      });
    } catch (error) {
      this.errorMessage = "Error al acceder al sistema médico";
      this.isLoading = false;
    }
  }

  async loginPatient() {
    this.isLoading = true;
    this.errorMessage = "";
    this.showRegistrationPrompt = false;

    try {
      const dni = parseInt(this.patientCredentials.dni);

      // Validar que el DNI sea un número válido
      if (isNaN(dni) || dni <= 0) {
        this.errorMessage = "Por favor ingresa un DNI válido";
        this.isLoading = false;
        return;
      }

      // Buscar paciente por DNI en el backend
      this.pacienteService.findByDni(dni).subscribe({
        next: (response: any) => {
          console.log("Respuesta del servidor:", response);

          // Verificar si la respuesta tiene los datos del paciente
          // El backend envía status_code, no status
          if (response && response.data && response.status_code === 200) {
            // Paciente encontrado, iniciar sesión
            localStorage.setItem("userRole", "patient");
            localStorage.setItem("patientDNI", this.patientCredentials.dni);
            localStorage.setItem("patientData", JSON.stringify(response.data));
            localStorage.setItem("pacienteId", response.data.id.toString()); // ← Agregar esta línea
            localStorage.setItem(
              "userName",
              `${response.data.nombre} ${response.data.apellido}`
            );

            this.isLoading = false;
            this.router.navigate(["/paciente-dashboard"]);
          } else {
            // No se encontró el paciente
            this.showRegistrationPrompt = true;
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error("Error al buscar paciente:", error);
          if (error.status === 404) {
            // Paciente no encontrado
            this.showRegistrationPrompt = true;
          } else {
            this.errorMessage =
              "Error al conectar con el servidor. Intenta nuevamente.";
          }
          this.isLoading = false;
        },
      });
    } catch (error) {
      this.errorMessage = "Error inesperado. Por favor intenta nuevamente.";
      this.isLoading = false;
    }
  }
  async loginOperador() {
    this.isLoading = true;
    this.errorMessage = "";

    try {
      // Aquí iría tu llamada al backend para validar el operador
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simula delay

      // Guardar en localStorage
      localStorage.setItem("userRole", "operador");
      localStorage.setItem("userName", this.operadorCredentials.username);

      this.isLoading = false;
      this.router.navigate(["/operador-dashboard"]); // Ajustar ruta
    } catch (error) {
      this.errorMessage = "Usuario o contraseña inválidos";
      this.isLoading = false;
    }
  }

  registerPatient() {
    this.showRegistrationForm = true;
    this.showRegistrationPrompt = false;
    this.registrationData.dni = this.patientCredentials.dni;
  }

  loadObrasSociales() {
    this.pacienteService.getObrasSociales().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.obrasSociales = response.data;
        }
      },
      error: (error) => {
        console.error("Error al cargar obras sociales:", error);
        this.obrasSociales = [];
      },
    });
  }

  async submitRegistration() {
    this.isRegistering = true;
    this.errorMessage = "";

    try {
      // Preparar datos del paciente
      const nuevoPaciente: Partial<Paciente> = {
        nombre: this.registrationData.nombre,
        apellido: this.registrationData.apellido,
        email: this.registrationData.email,
        telefono: this.registrationData.telefono,
        dni: parseInt(this.registrationData.dni),
        fechaNacimiento: this.registrationData.fechaNacimiento,
      };

      // Agregar obra social si se seleccionó
      if (this.registrationData.obraSocialId) {
        const obraSocial = this.obrasSociales.find(
          (o) => o.id == this.registrationData.obraSocialId
        );
        if (obraSocial) {
          nuevoPaciente.obraSocial = obraSocial;
        }
      }

      // Crear paciente
      this.pacienteService.create(nuevoPaciente as Paciente).subscribe({
        next: (response) => {
          if (response && response.data) {
            // Registro exitoso - iniciar sesión automáticamente
            localStorage.setItem("userRole", "patient");
            localStorage.setItem("patientDNI", this.registrationData.dni);
            localStorage.setItem("patientData", JSON.stringify(response.data));
            localStorage.setItem("pacienteId", response.data.id.toString());
            localStorage.setItem(
              "userName",
              `${response.data.nombre} ${response.data.apellido}`
            );

            this.isRegistering = false;
            this.router.navigate(["/paciente-dashboard"]);
          } else {
            throw new Error("No se recibieron datos del paciente creado");
          }
        },
        error: (error) => {
          console.error("Error al registrar paciente:", error);
          this.errorMessage =
            "Error al registrar el paciente. Verifica que todos los datos sean correctos.";
          this.isRegistering = false;
        },
      });
    } catch (error) {
      this.errorMessage =
        "Error inesperado durante el registro. Por favor intenta nuevamente.";
      this.isRegistering = false;
    }
  }

  cancelRegistration() {
    this.showRegistrationForm = false;
    this.showRegistrationPrompt = true;
    this.resetRegistrationData();
    this.errorMessage = "";
  }

  resetRegistrationData() {
    this.registrationData = {
      dni: "",
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      fechaNacimiento: "",
      obraSocialId: "",
    };
  }
}
