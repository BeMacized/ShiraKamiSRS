import { Injectable } from '@angular/core';
import { ThemeService } from './theme.service';
import { AppSettingsService } from './app-settings.service';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root',
})
export class AppInitService {
    constructor(
        private themeService: ThemeService,
        private appSettings: AppSettingsService,
        private authService: AuthService,
    ) {}

    async init(): Promise<void> {
        await this.themeService.init();
        await this.appSettings.fetchSettings();
        await this.authService.init();
    }
}
