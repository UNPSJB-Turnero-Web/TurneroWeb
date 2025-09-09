import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { RecuperarContrasenaService } from "../services/recuperarContrasena.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-recuperar-contrasena",
  standalone: true,
  templateUrl: "./recuperar-contrasena.component.html",
  imports: [CommonModule, ReactiveFormsModule],
})
export class RecuperarContrasenaComponent implements OnInit {
  correoForm!: FormGroup;
  enviando = false;
  enviadoOk: boolean | null = null;
  mensaje = "";
  
  // Particles for background animation
  particles: Array<{x: number, y: number}> = [];

  constructor(
    private fb: FormBuilder,
    private svc: RecuperarContrasenaService
  ) {
    this.initializeParticles();
  }

  ngOnInit(): void {
    this.correoForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
    });
  }
  enviarSolicitud() {
    if (this.correoForm.invalid) {
      this.correoForm.markAllAsTouched();
      return;
    }
    this.enviando = true;
    this.enviadoOk = null;
    const email = this.correoForm.value.email;
    this.svc.requestReset(email).subscribe({
      next: () => {
        this.enviadoOk = true;
        this.mensaje =
          "Se ha enviado un correo con instrucciones si la cuenta existe.";
        this.enviando = false;
      },
      error: (err) => {
        console.error("Error requestReset", err);
        // No revelar existencia de cuenta — mensaje genérico
        this.enviadoOk = false;
        this.mensaje = "Si el correo existe, recibirá instrucciones por email.";
        this.enviando = false;
      },
    });
  }

  get emailControl() {
    return this.correoForm.get("email");
  }

  private initializeParticles() {
    this.particles = [];
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight
      });
    }
  }
}
