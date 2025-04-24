import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from './customer.service';
import { Customer } from './customer';
import { DataPackage } from '../data.package';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h2 *ngIf="!customer.id">Nuevo Cliente</h2>
      <h2 *ngIf="customer.id">Editar Cliente #{{ customer.id }}</h2>

      <form (ngSubmit)="save()" #form="ngForm">
        <div class="mb-3">
          <label for="name" class="form-label">Nombre</label>
          <input
            type="text"
            id="name"
            class="form-control"
            required
            [(ngModel)]="customer.name"
            name="name"
          />
        </div>

        <button class="btn btn-primary" type="submit" [disabled]="!form.valid">Guardar</button>
        <button class="btn btn-secondary ms-2" type="button" (click)="goBack()">Cancelar</button>
      </form>
    </div>
  `,
  styles: []
})
export class CustomerDetailComponent implements OnInit {
  customer: Customer = { id: 0, name: '' };

  constructor(
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    if (id) {
      this.customerService.get(id).subscribe((dp: DataPackage) => {
        this.customer = dp.data as Customer;
      });
    }
  }

  save(): void {
    this.customerService.save(this.customer).subscribe(() => {
      this.router.navigate(['/customers']);
    });
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }
}
