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

export function initializeApp(appInitService: AppInitService) {
    return () => appInitService.init();
}

@NgModule({
    declarations: [AppComponent, DashboardViewComponent, LoginViewComponent, DebugViewComponent, CardSetCardComponent, ReviewForecastComponent, CollapsibleComponent],
    imports: [BrowserModule, BrowserAnimationsModule, AppRoutingModule],
    providers: [
        ThemeService,
        AppInitService,
        {
            provide: APP_INITIALIZER,
            useFactory: initializeApp,
            deps: [AppInitService],
            multi: true,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
}
