import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginViewComponent } from './views/login-view/login-view.component';
import { DashboardViewComponent } from './views/dashboard-view/dashboard-view.component';
import { DebugViewComponent } from './views/debug-view/debug-view.component';

const routes: Routes = [
    {
        path: 'login',
        component: LoginViewComponent,
    },
    {
        path: 'dashboard',
        component: DashboardViewComponent,
    },
    {
        path: 'debug',
        component: DebugViewComponent,
    },
    {
        path: '**',
        redirectTo: 'login',
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
