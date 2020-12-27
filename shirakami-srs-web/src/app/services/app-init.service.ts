import { Injectable } from '@angular/core';
import { ThemeService } from './theme.service';

@Injectable({
    providedIn: 'root',
})
export class AppInitService {
    constructor(private themeService: ThemeService) {}

    async init(): Promise<void> {
        await this.themeService.init();
    }
}
