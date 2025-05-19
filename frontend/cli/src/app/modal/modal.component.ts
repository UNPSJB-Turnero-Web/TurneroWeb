import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
 <div class="modal-header">
      <h4 class="modal-title" id="modal-title">{{title}}</h4>
      <button type="button" class="close" aria-describedby="modal-title" (click)="modal.dismiss()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <p>
        <strong>{{message}}</strong>
      </p>
      <p *ngIf="description">
        <strong>{{description}}</strong>
      </p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-secondary" (click)="modal.dismiss()">Cancelar</button>
      <button type="button" class="btn btn-success" (click)="modal.close()">Aceptar</button>
    </div>
  `,
  styles: `
  .modal-header {
    border-radius: 1rem 1rem 0 0;
    border-bottom: 1px solid #e9ecef;
    background: #f8f9fa;
  }

  .modal-title {
    font-size: 1.35rem;
    font-weight: 600;
  }

  .btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    opacity: 0.7;
    transition: opacity 0.2s;
  }
  .btn-close:hover {
    opacity: 1;
  }

  .modal-footer {
    border-radius: 0 0 1rem 1rem;
    border-top: 1px solid #e9ecef;
    background: #f8f9fa;
  }
  `
})
export class ModalComponent {
  constructor(public modal: NgbActiveModal) {}

  title!: string;
  message!: string;
  description!: string;
  isAlert: boolean = false; // Nueva propiedad para diferenciar alertas

  close(): void {
    this.modal.close();
  }

  dismiss(): void {
    this.modal.dismiss();
  }
}
