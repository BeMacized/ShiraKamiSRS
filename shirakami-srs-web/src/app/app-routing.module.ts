import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
import { LessonReviewViewComponent } from './views/lesson-review-view/lesson-review-view.component';
import { EmailVerificationViewComponent } from './views/email-verification-view/email-verification-view.component';
import { PasswordResetViewComponent } from './views/password-reset-view/password-reset-view.component';
import { SetBrowseViewComponent } from './views/set-browse-view/set-browse-view.component';

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
        path: 'lessons',
        canActivate: [AuthGuardService],
        component: LessonReviewViewComponent,
        data: { mode: 'LESSONS', animation: 'lessons' },
    },
    {
        path: 'reviews',
        canActivate: [AuthGuardService],
        component: LessonReviewViewComponent,
        data: { mode: 'REVIEWS', animation: 'reviews' },
    },
    {
        path: 'set/:id',
        canActivate: [AuthGuardService],
        component: SetViewComponent,
        data: { animation: 'setDetails' },
    },
    {
        path: 'browsesets',
        canActivate: [AuthGuardService],
        component: SetBrowseViewComponent,
        data: { animation: 'browsesets' },
    },
    {
        path: 'emailverification',
        component: EmailVerificationViewComponent,
        data: { animation: 'emailverification' },
    },
    {
        path: 'passwordreset',
        component: PasswordResetViewComponent,
        data: { animation: 'passwordreset' },
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

    routeFadeUpPush('*', 'lessons'),
    routeFadeUpPop('lessons', '*'),

    routeFadeUpPush('*', 'reviews'),
    routeFadeUpPop('reviews', '*'),
]);

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
