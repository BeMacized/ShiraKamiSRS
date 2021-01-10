import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginViewComponent } from './views/login-view/login-view.component';
import { DashboardViewComponent } from './views/dashboard-view/dashboard-view.component';
import { DebugViewComponent } from './views/debug-view/debug-view.component';
import { NonAuthGuardService } from './guards/non-auth-guard.service';
import { AuthGuardService } from './guards/auth-guard.service';
import { SetViewComponent } from './views/set-view/set-view.component';
import { trigger } from '@angular/animations';
import {
    routeFadeUpPop,
    routeFadeUpPush,
    routeSlidePop,
    routeSlidePush,
} from './utils/route-transitions';

const routes: Routes = [
    {
        path: 'login',
        canActivate: [NonAuthGuardService],
        component: LoginViewComponent,
        data: { animation: 'login' },
    },
    {
        path: 'dashboard',
        canActivate: [AuthGuardService],
        component: DashboardViewComponent,
        data: { animation: 'dashboard' },
    },
    {
        path: 'set/:id',
        canActivate: [AuthGuardService],
        component: SetViewComponent,
        data: { animation: 'setDetails' },
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

export const routeAnimations = trigger('routeAnimations', [
    routeSlidePush('dashboard', 'setDetails'),
    routeSlidePop('setDetails', 'dashboard'),
    routeFadeUpPush('login', '*'),
    routeFadeUpPop('*', 'login'),
]);

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
