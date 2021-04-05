import { ApplicationRef, Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { SnackbarService } from './snackbar.service';
import { first } from 'rxjs/operators';
import { concat, interval } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UpdateService {
    constructor(
        private update: SwUpdate,
        private snackbarService: SnackbarService,
        private appRef: ApplicationRef
    ) {}

    init() {
        if (!this.update.isEnabled) {
            console.warn(
                'Service worker is not enabled. Disabling update service.'
            );
            return;
        }
        const appIsStable$ = this.appRef.isStable.pipe(
            first((isStable) => isStable === true)
        );
        concat(appIsStable$, interval(60000)).subscribe(async () => {
            await this.update.checkForUpdate();
        });
        this.update.available.subscribe((event) => {
            console.log('ShiraKamiSRS front-end update available');
            this.snackbarService.showSnackbar({
                text: 'A new version of ShiraKamiSRS is available.',
                timeout: 0,
                action: {
                    label: 'Update',
                    onTap: async (snackbar) => {
                        snackbar.dismiss();
                        await this.update.activateUpdate();
                        setTimeout(() => window.location.reload(), 1500);
                    },
                },
            });
        });
        this.update.activated.subscribe((event) => {
            this.snackbarService.showSnackbar({
                text: 'New ShiraKamiSRS version loading...',
                timeout: 1500,
            });
        });
    }
}
