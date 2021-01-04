import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { AppSettings } from '../models/app-settings.model';

@Injectable({
    providedIn: 'root',
})
export class AppSettingsService {
    private readonly _appSettings: ReplaySubject<AppSettings> = new ReplaySubject<AppSettings>(
        1
    );
    public readonly appSettings: Observable<AppSettings> = this._appSettings.asObservable();

    constructor(private http: HttpClient) {}

    fetchSettings(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http
                .get('assets/appsettings.json')
                .toPromise()
                .then((response) => {
                    this._appSettings.next(response as AppSettings);
                    resolve();
                })
                .catch((e) => {
                    console.error(e);
                    reject(e);
                });
        });
    }
}
