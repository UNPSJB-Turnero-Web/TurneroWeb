import { Component } from "@angular/core";
import { NgbCalendar, NgbDateStruct, NgbDatepickerModule, NgbTypeaheadModule } from "@ng-bootstrap/ng-bootstrap";
import { Bordero } from "./bordero";
import { ActivatedRoute, Router } from "@angular/router";
import { BorderoService } from "./bordero.service";
import { CustomerService } from "../customer/customer.service";
import { PlayService } from "../plays/play.service";
import { CommonModule, Location } from "@angular/common";
import { ModalService } from "../modal/modal.service";
import { Customer } from "../customer/customer";
import { Performance } from "./performance";

import {
  Observable,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  switchMap,
  tap,
} from "rxjs";

import { Play } from "../plays/play";
import { FormsModule } from "@angular/forms";
import { DataPackage } from "../data.package";

@Component({
  selector: "app-bordero-detail",
  standalone: true,
  imports: [CommonModule, FormsModule, NgbTypeaheadModule, NgbDatepickerModule],
  templateUrl: 'bordero-detail.component.html',
  styles: ``,
})
export class BorderoDetailComponent {
  bordero!: Bordero;
  borderoDate!: NgbDateStruct;
  searching: boolean = false;
  searchFailed: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private borderoService: BorderoService,
    private customerService: CustomerService,
    private playService: PlayService,
    private location: Location,
    private calendar: NgbCalendar,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.get();
  }

  get() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'new') {
      this.bordero = {
        id: 0, // <- valor temporal
        date: new Date(), // <- valor por defecto
        customer: <Customer>{},
        performances: [] // <- Asegurar que exista el array
      };
      this.borderoDate = this.calendar.getToday();
    } else {
      this.borderoService.get(parseInt(id!)).subscribe((dataPackage) => {
        this.bordero = <Bordero>dataPackage.data;
        this.bordero.performances ??= []; // <- Si viene null, lo inicializamos
        const borderoDateAux = new Date(this.bordero.date);
        this.borderoDate = {
          year: borderoDateAux.getFullYear(),
          month: borderoDateAux.getMonth() + 1,
          day: borderoDateAux.getDate()
        };
      });
    }
  }
  

  goBack() {
    this.location.back();
  }

  save() {
    if (!this.borderoDate) {
      this.borderoDate = this.calendar.getToday();
    }
  
    this.bordero.date = new Date(
      this.borderoDate.year,
      this.borderoDate.month - 1,
      this.borderoDate.day
    );

    this.bordero.performances.forEach((perf) => {
      perf.audience = Number(perf.audience);
    });

    console.log(this.bordero);
    this.borderoService.save(this.bordero).subscribe({
      next: (dataPackage) => {
        const id = (dataPackage.data as Bordero).id;
        console.log("✅ Bordero guardado con ID", id);
        this.router
          .navigateByUrl("/", { skipLocationChange: true })
          .then(() => this.router.navigate(["/borderos/" + id]));
      },
      error: (err) => {
        console.error("❌ Error al guardar el bordero:", err);
        alert("Hubo un error al guardar el bordero");
      },
    });
    
  }
  

  searchCustomer = (text$: Observable<string>): Observable<any[]> =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.searching = true)),
      switchMap((term) =>
        this.customerService.search(term).pipe(
          map((response) => {
            let customers = <Customer[]>response.data;
            return customers;
          }),
          tap(() => (this.searchFailed = false)),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          })
        )
      ),
      tap(() => (this.searching = false))
    );

  searchPlay = (text$: Observable<string>): Observable<any[]> =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.searching = true)),
      switchMap((term) =>
        this.playService.search(term).pipe(
          map((response) => {
            let plays = <Play[]>response.data;
            return plays;
          }),
          tap(() => (this.searchFailed = false)),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          })
        )
      ),
      tap(() => (this.searching = false))
    );

  resultFormat(value: any) {
    return value.name;
  }

  inputFormat(value: any) {
    return value ? value.name : null;
  }

  addPerformance() {
    if (!this.bordero.performances) {
      this.bordero.performances = [];
    }
  
    this.bordero.performances.push({
      play: <Play>{},
      audience: 0
    });
  }
  
  removePerformance(performance: Performance) {
    this.modalService
      .confirm("Eliminar performance", "¿Está seguro de borrar esta performance?", "El cambio no se puede deshacer")
      .then(() => {
        let performances = this.bordero.performances;
        performances.splice(performances.indexOf(performance), 1);
      });
  }
  remove(id: number): void {
    const that = this;
    this.modalService
      .confirm("Eliminar bordero", "¿Está seguro de borrar el bordero?", "Esta acción no se puede deshacer")
      .then(() => {
        that.borderoService.remove(id).subscribe(() => that.goBack());
      });
  }

  
}