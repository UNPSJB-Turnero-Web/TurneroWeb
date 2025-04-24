import { Component } from '@angular/core';
import { CommonModule, Location, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Play } from './play';
import { PlayType } from '../playType/playType';
import { ActivatedRoute } from '@angular/router';
import { PlayService } from './play.service';
import { PlayTypeService } from '../playType/playType.service';
import { DataPackage } from '../data.package';
import { ModalService } from '../modal/modal.service';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs';

@Component({
  selector: 'app-plays-detail',
  standalone: true,
  imports: [UpperCasePipe, FormsModule, CommonModule, NgbTypeaheadModule],
  template: `
<div *ngIf="play">
  <h2>{{ play.name | uppercase }}</h2>
  <form #form="ngForm">
    <div class="form-group">
      <label for="name">Nombre:</label>
      <input name="name" required placeholder="Nombre" class="form-control" [(ngModel)]="play.name" #name="ngModel">
      <div *ngIf="name.invalid && (name.dirty || name.touched)" class="alert">
        <div *ngIf="name.errors?.['required']">
          El nombre de la obra es requerido
        </div>
      </div>
    </div>

    <div class="form-group">
      <label for="code">Código:</label>
      <input name="code" placeholder="Código" class="form-control" [(ngModel)]="play.code">
    </div>

    <div class="form-group">
      <label for="type">Tipo:</label>
      <input 
        class="form-control"
        [ngbTypeahead]="searchPlayTypes"
        [inputFormatter]="formatter"
        [resultFormatter]="formatter"
        [(ngModel)]="play.type"
        (selectItem)="onPlayTypeSelected($event.item)"
        name="playType"
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
export class PlaysDetailComponent {
  play!: Play;
  types: PlayType[] = [];
  selectedPlayType!: PlayType;



  constructor(
    private route: ActivatedRoute,
    private playService: PlayService,
    private playTypeService: PlayTypeService,
    private location: Location,
    private modalService: ModalService
  ) { }

  goBack(): void {
    this.location.back();
  }

  save(): void {
    console.log(this.play);
    this.playService.save(this.play).subscribe((dataPackage) => {
      this.play = <Play>dataPackage.data;
      this.goBack();
    });
  }

  get(): void {
    const path = this.route.snapshot.routeConfig?.path;

    if (path === 'plays/new') {
      this.play = <Play>{ type: {} };
    } else {
      const code = this.route.snapshot.paramMap.get('code')!;
      this.playService.get(code).subscribe(dataPackage => {
        this.play = <Play>dataPackage.data;
      });
    }
  }



  getTypes(): void {
    this.playTypeService.all().subscribe((res) => {
      this.types = res.data as PlayType[];
    });

  }
  // 🔍 Autocompletado
  searchPlayTypes = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.playTypeService.search(term))
    );

  formatter = (x: PlayType) => x.type;

  onPlayTypeSelected(playType: PlayType): void {
    this.play.type = playType;
  }
  
  


  ngOnInit(): void {
    this.getTypes();
    this.get();
    this.selectedPlayType = this.play.type; // 
  }
}
