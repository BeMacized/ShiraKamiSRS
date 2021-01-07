import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardViewComponent } from './views/dashboard-view/dashboard-view.component';
import { LoginViewComponent } from './views/login-view/login-view.component';
import { ThemeService } from './services/theme.service';
import { AppInitService } from './services/app-init.service';
import { DebugViewComponent } from './views/debug-view/debug-view.component';
import { CardSetCardComponent } from './components/card-set-card/card-set-card.component';
import { ReviewForecastComponent } from './components/review-forecast/review-forecast.component';
import { CollapsibleComponent } from './components/collapsible/collapsible.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainNavComponent } from './components/main-nav/main-nav.component';
import { LogoComponent } from './components/logo/logo.component';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { AuthInterceptor } from './interceptors/auth-interceptor.service';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { SetCreationViewComponent } from './views/set-creation-view/set-creation-view.component';

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
        SetCreationViewComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        FormsModule,
        AppRoutingModule,
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
})
export class AppModule {}
