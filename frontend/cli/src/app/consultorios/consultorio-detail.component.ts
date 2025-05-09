import { Component } from '@angular/core';
import { CommonModule, Location, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Consultorio } from './consultorio';
import { CentroAtencion } from '../centrosAtencion/centroAtencion';
import { ActivatedRoute } from '@angular/router';
import { ConsultorioService } from './consultorio.service';
import { CentroAtencionService } from '../centrosAtencion/centroAtencion.service';
import { DataPackage } from '../data.package';
import { ModalService } from '../modal/modal.service';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs';

@Component({
  selector: 'app-consultorio-detail',
  standalone: true,
  imports: [UpperCasePipe, FormsModule, CommonModule, NgbTypeaheadModule],
  template: `
<div *ngIf="consultorio">
  <h2>{{ consultorio.id === 0 ? 'Nuevo Consultorio' : consultorio.name | uppercase }}</h2>
  <form #form="ngForm">
    <div class="form-group">
      <label for="name">Nombre:</label>
      <input name="name" required placeholder="Nombre" class="form-control" [(ngModel)]="consultorio.name" #name="ngModel">
      <div *ngIf="name.invalid && (name.dirty || name.touched)" class="alert">
        <div *ngIf="name.errors?.['required']">
          El nombre del consultorio es requerido
        </div>
      </div>
    </div>

    <div class="form-group">
      <label for="code">Código:</label>
      <input name="code" placeholder="Código" class="form-control" [(ngModel)]="consultorio.code">
    </div>

    <div class="form-group">
      <label for="centroAtencion">Centro de Atención:</label>
      <input 
        class="form-control"
        [ngbTypeahead]="searchCentrosAtencion"
        [inputFormatter]="formatter"
        [resultFormatter]="formatter"
        [(ngModel)]="consultorio.centroAtencion"
        (selectItem)="onCentroAtencionSelected($event.item)"
        name="centroAtencion"
        required
      />
    </div>

    <button (click)="goBack()" class="btn btn-danger">Atrás</button>
    <button (click)="save()" class="btn btn-success" [disabled]="form.invalid">Guardar</button>
  </form>
</div>
  `,
  styles: ``
})
export class ConsultorioDetailComponent {
  consultorio!: Consultorio;
  centrosAtencion: CentroAtencion[] = [];
  selectedCentroAtencion!: CentroAtencion;

  constructor(
    private route: ActivatedRoute,
    private consultorioService: ConsultorioService,
    private centroAtencionService: CentroAtencionService,
    private location: Location,
    private modalService: ModalService
  ) { }

  goBack(): void {
    this.location.back();
  }

  save(): void {
    if (!this.consultorio.centroAtencion || !this.consultorio.centroAtencion.id) {
      this.modalService.alert('Error', 'Debe seleccionar un Centro de Atención válido.');
      return;
    }

    this.consultorioService.save(this.consultorio).subscribe({
      next: (dataPackage) => {
        this.consultorio = <Consultorio>dataPackage.data;
        this.goBack();
      },
      error: (err) => {
        this.modalService.alert('Error', 'No se pudo guardar el consultorio. Intente nuevamente.');
      }
    });
  }

  get(): void {
    const path = this.route.snapshot.routeConfig?.path;

    if (path === 'consultorios/new') {
      this.consultorio = {
        id: 0,
        code: '',
        name: '',
        centroAtencion: {} as CentroAtencion, // Inicializar con un objeto vacío
      };
    } else {
      const code = this.route.snapshot.paramMap.get('code')!;
      this.consultorioService.get(code).subscribe((dataPackage) => {
        this.consultorio = <Consultorio>dataPackage.data;
      });
    }
  }

  getCentrosAtencion(): void {
    this.centroAtencionService.all().subscribe((res) => {
      this.centrosAtencion = res.data as CentroAtencion[];
    });
  }

  // 🔍 Autocompletado
  searchCentrosAtencion = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term =>
        this.centroAtencionService.search(term).pipe(
          map((response) => response.data as CentroAtencion[]) // Extract the data array
        )
      )
    );

  formatter = (x: CentroAtencion) => x.name;

  onCentroAtencionSelected(centroAtencion: CentroAtencion): void {
    this.consultorio.centroAtencion = centroAtencion;
  }

  ngOnInit(): void {
    this.getCentrosAtencion();
    this.get();
    this.selectedCentroAtencion = this.consultorio.centroAtencion;
  }
}
