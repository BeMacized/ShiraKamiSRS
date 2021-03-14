import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardViewComponent } from './views/dashboard-view/dashboard-view.component';
import { LoginViewComponent } from './views/login-view/login-view.component';
import { ThemeService } from './services/theme.service';
import { AppInitService } from './services/app-init.service';
import { DebugViewComponent } from './views/debug-view/debug-view.component';
import { CardSetCardComponent } from './components/misc/card-set-card/card-set-card.component';
import { ReviewForecastComponent } from './components/misc/review-forecast/review-forecast.component';
import { CollapsibleComponent } from './components/misc/collapsible/collapsible.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainNavComponent } from './components/misc/main-nav/main-nav.component';
import { LogoComponent } from './components/misc/logo/logo.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { SpinnerComponent } from './components/misc/spinner/spinner.component';
import { AuthInterceptor } from './interceptors/auth-interceptor.service';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { SafePopupBaseComponent } from './components/misc/safe-popup-base/safe-popup-base.component';
import { GenericContextMenuComponent } from './components/misc/generic-context-menu/generic-context-menu.component';
import { CreateSetModalComponent } from './components/modals/create-set-modal/create-set-modal.component';
import { SmoothHeightDirective } from './directives/smooth-height.directive';
import { EditSetModesModalComponent } from './components/modals/edit-set-modes-modal/edit-set-modes-modal.component';
import { SetModeTogglesComponent } from './components/misc/set-mode-toggles/set-mode-toggles.component';
import { EditSetNameModalComponent } from './components/modals/edit-set-name-modal/edit-set-name-modal.component';
import { DeleteSetModalComponent } from './components/modals/delete-set-modal/delete-set-modal.component';
import { SetViewComponent } from './views/set-view/set-view.component';
import { CardCardComponent } from './components/misc/card-card/card-card.component';
import { CreateEditCardModalComponent } from './components/modals/create-edit-card-modal/create-edit-card-modal.component';
import { CheckboxComponent } from './components/inputs/checkbox/checkbox.component';
import { ConfirmationModalComponent } from './components/modals/confirmation-modal/confirmation-modal.component';
import { MomentModule } from 'ngx-moment';
import { LessonReviewViewComponent } from './views/lesson-review-view/lesson-review-view.component';
import { Ng2FittextModule } from 'ng2-fittext';
import { NgPipesModule } from 'ngx-pipes';
import { WanakanaDirective } from './directives/wanakana.directive';
import { ExportSetModalComponent } from './components/modals/export-set-modal/export-set-modal.component';
import { ImportSetModalComponent } from './components/modals/import-set-modal/import-set-modal.component';
import { buildVersion } from '../assets/build-version.json';
import { EmailVerificationViewComponent } from './views/email-verification-view/email-verification-view.component';
import { PasswordResetViewComponent } from './views/password-reset-view/password-reset-view.component';

export function initializeApp(appInitService: AppInitService) {
    return () => appInitService.init();
}

@NgModule({
    declarations: [
        AppComponent,
        DashboardViewComponent,
        LoginViewComponent,
        DebugViewComponent,
        CardSetCardComponent,
        ReviewForecastComponent,
        CollapsibleComponent,
        MainNavComponent,
        LogoComponent,
        SpinnerComponent,
        ClickOutsideDirective,
        SafePopupBaseComponent,
        GenericContextMenuComponent,
        CreateSetModalComponent,
        SmoothHeightDirective,
        EditSetModesModalComponent,
        SetModeTogglesComponent,
        EditSetNameModalComponent,
        DeleteSetModalComponent,
        SetViewComponent,
        CardCardComponent,
        CreateEditCardModalComponent,
        CheckboxComponent,
        ConfirmationModalComponent,
        LessonReviewViewComponent,
        WanakanaDirective,
        ExportSetModalComponent,
        ImportSetModalComponent,
        EmailVerificationViewComponent,
        PasswordResetViewComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        MomentModule,
        Ng2FittextModule,
        NgPipesModule,
    ],
    providers: [
        ThemeService,
        AppInitService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        {
            provide: APP_INITIALIZER,
            useFactory: initializeApp,
            deps: [AppInitService],
            multi: true,
        },
    ],
    bootstrap: [AppComponent],
    // entryComponents: [],
})
export class AppModule {
    constructor() {
        console.log(`Loading ShiraKamiSRS v${buildVersion}`);
    }
}
