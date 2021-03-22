import { Component } from '@angular/core';
import { routeAnimations } from './app-routing.module';
import { MenuService } from './services/menu.service';
import { fade } from './utils/animations';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [routeAnimations, fade()],
})
export class AppComponent {
    constructor(public menuService: MenuService) {}
}
