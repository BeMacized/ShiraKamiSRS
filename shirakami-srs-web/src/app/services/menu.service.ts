import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class MenuService {
    _showMobileMenu: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false
    );
    showMobileMenu: Observable<boolean> = this._showMobileMenu.asObservable();

    constructor(private router: Router) {
        router.events
            .pipe(filter((e) => e instanceof NavigationEnd))
            .subscribe(() => this._showMobileMenu.next(false));
    }

    toggleMobileMenu() {
        this._showMobileMenu.next(!this._showMobileMenu.value);
    }
}
