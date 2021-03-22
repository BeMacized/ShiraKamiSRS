import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MenuService {
    _showMobileMenu: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false
    );
    showMobileMenu: Observable<boolean> = this._showMobileMenu.asObservable();

    constructor() {}

    toggleMobileMenu() {
        this._showMobileMenu.next(!this._showMobileMenu.value);
    }
}
