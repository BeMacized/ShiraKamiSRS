import { Component } from '@angular/core';
import { routeAnimations } from './app-routing.module';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [routeAnimations],
})
export class AppComponent {}
