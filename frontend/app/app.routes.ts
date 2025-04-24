import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PlaysComponent } from './plays/plays.component';
import { PlaysDetailComponent } from './plays/plays-detail.component';
import { BorderoDetailComponent } from './bordero/bordero-detail.component';
import { CustomersComponent } from './customer/customers.component';
import { BorderosComponent } from './bordero/bordero.component';
import { CustomerDetailComponent } from './customer/customer-detail.component';
import { PlayTypesComponent } from './playType/playType.component';
import { PlayTypeDetailComponent } from './playType/playType-detail.component';


export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'plays', component: PlaysComponent},
    {path: 'plays/code/:code', component: PlaysDetailComponent},
    {path: 'plays/new', component: PlaysDetailComponent },
    {path: 'borderos', component: BorderosComponent },
    {path: 'borderos/:id', component: BorderoDetailComponent},
    {path: 'borderos/new', component: BorderoDetailComponent },
    {path: 'customers', component: CustomersComponent},
    {path: 'customers/:id', component: CustomerDetailComponent },
    {path: 'customers/new', component: CustomerDetailComponent },
    { path: 'playtypes', component: PlayTypesComponent },
    { path: 'playtypes/new', component: PlayTypeDetailComponent },
    { path: 'playtypes/:id', component: PlayTypeDetailComponent },

];
