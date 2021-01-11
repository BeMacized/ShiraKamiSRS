import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Subject } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { takeUntil } from 'rxjs/operators';
import { User } from '../../../models/user.model';
import { fadeDown, hshrink } from '../../../utils/animations';
import { Router } from '@angular/router';
import {ThemeService} from '../../../services/theme.service';

@Component({
    selector: 'app-main-nav',
    templateUrl: './main-nav.component.html',
    styleUrls: ['./main-nav.component.scss'],
    animations: [fadeDown('dropdown'), hshrink()],
})
export class MainNavComponent implements OnInit, OnDestroy {
    user: User;
    destroy$: Subject<void> = new Subject();
    showAccountDropdown = false;
    @Input() backRoute: any[];

    constructor(
        public authService: AuthService,
        private userService: UserService,
        private router: Router,
        public theme: ThemeService
    ) {
        this.userService.user
            .pipe(takeUntil(this.destroy$))
            .subscribe((user) => (this.user = user));
    }

    ngOnInit(): void {}

    ngOnDestroy() {
        this.destroy$.next();
    }

    clickAccount() {
        setTimeout(
            () => (this.showAccountDropdown = !this.showAccountDropdown)
        );
    }

    goBack() {
        this.router.navigate(this.backRoute);
    }
}
