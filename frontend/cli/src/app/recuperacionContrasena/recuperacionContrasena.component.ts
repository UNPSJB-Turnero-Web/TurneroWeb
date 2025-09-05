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
  selector: "app-password-recovery",
  standalone: true,
  templateUrl: "./recuperar-contrasena.component.html",
  imports: [CommonModule, ReactiveFormsModule],
})
export class RecuperarContrasenaComponent implements OnInit {
  correoForm!: FormGroup;
  enviando = false;
  enviadoOk: boolean | null = null;
  mensaje = "";

  constructor(
    private fb: FormBuilder,
    private svc: RecuperarContrasenaService
  ) {}

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
}
