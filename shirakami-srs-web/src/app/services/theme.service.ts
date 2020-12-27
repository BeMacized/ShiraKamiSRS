import { Injectable } from '@angular/core';
import { JSONSchema, StorageMap } from '@ngx-pwa/local-storage';
import { catchError, map, take } from 'rxjs/operators';
import { of } from 'rxjs';

type ThemingMode = 'SYSTEM' | 'LIGHT' | 'DARK';
interface ThemingSettings {
    mode: ThemingMode;
}

const THEMING_SETTINGS_DEFAULT: ThemingSettings = {
    mode: 'SYSTEM',
};
const THEMING_SETTINGS_KEY = 'THEMING_SETTINGS';
const THEMING_SETTINGS_SCHEME: JSONSchema = {
    type: 'object',
    properties: {
        mode: { type: 'string', enum: ['SYSTEM', 'LIGHT', 'DARK'] },
    },
    required: ['mode'],
};

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private _settings: ThemingSettings = { ...THEMING_SETTINGS_DEFAULT };
    public get settings(): ThemingSettings {
        return { ...this._settings };
    }

    constructor(private storage: StorageMap) {}

    public async init() {
        this.storage
            .watch<ThemingSettings>(
                THEMING_SETTINGS_KEY,
                THEMING_SETTINGS_SCHEME
            )
            .pipe(
                map((value) => value ?? { ...THEMING_SETTINGS_DEFAULT }),
                catchError(() => of({ ...THEMING_SETTINGS_DEFAULT }))
            )
            .subscribe((settings) => {
                this._settings = settings;
                this.applyTheme();
            });
        window
            .matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', () => {
                if (this._settings.mode === 'SYSTEM') this.applyTheme();
            });
    }

    public async setMode(mode: ThemingMode): Promise<void> {
        this._settings.mode = mode;
        await this.saveSettings();
        await this.applyTheme();
    }

    private applyTheme() {
        let darkMode: boolean;
        switch (this._settings.mode) {
            case 'SYSTEM':
                darkMode = window.matchMedia('(prefers-color-scheme: dark)')
                    .matches;
                break;
            case 'LIGHT':
                darkMode = false;
                break;
            case 'DARK':
                darkMode = true;
                break;
        }
        if (darkMode) document.body.classList.add('dark');
        else document.body.classList.remove('dark');
    }

    private async saveSettings() {
        await this.storage
            .set(THEMING_SETTINGS_KEY, this._settings, THEMING_SETTINGS_SCHEME)
            .toPromise();
    }
}
