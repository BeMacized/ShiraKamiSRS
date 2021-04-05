import { Component } from '@angular/core';
import { routeAnimations } from './app-routing.module';
import { MenuService } from './services/menu.service';
import { fade, fadeUp } from './utils/animations';
import { SnackbarService } from './services/snackbar.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [routeAnimations, fade(), fadeUp()],
})
export class AppComponent {
    constructor(
        public menuService: MenuService,
        public snackbarService: SnackbarService
    ) {}
}
