import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginViewComponent } from './views/login-view/login-view.component';
import { DashboardViewComponent } from './views/dashboard-view/dashboard-view.component';
import { DebugViewComponent } from './views/debug-view/debug-view.component';
import { NonAuthGuardService } from './guards/non-auth-guard.service';
import { AuthGuardService } from './guards/auth-guard.service';
import { SetViewComponent } from './views/set-view/set-view.component';

const routes: Routes = [
    {
        path: 'login',
        canActivate: [NonAuthGuardService],
        component: LoginViewComponent,
    },
    {
        path: 'dashboard',
        canActivate: [AuthGuardService],
        component: DashboardViewComponent,
    },
    {
        path: 'set/:id',
        canActivate: [AuthGuardService],
        component: SetViewComponent,
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
