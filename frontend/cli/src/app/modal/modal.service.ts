import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from './modal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  constructor(private modalService: NgbModal) { }

  confirm(title: string, message: string, description: string): Promise<any> {
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.title = title;
    modal.componentInstance.message = message;
    modal.componentInstance.description = description;
    return modal.result;
  }

  alert(title: string, message: string): void {
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.title = title;
    modal.componentInstance.message = message;
    modal.componentInstance.description = ''; // Opcional, si no necesitas descripción
    modal.componentInstance.isAlert = true; // Puedes usar esta bandera en el componente para diferenciar entre alert y confirm
  }
}
