import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { UserService } from '../../services/user.service';
import { takeUntil } from 'rxjs/operators';
import {User} from '../../models/user.model';

@Component({
    selector: 'app-main-nav',
    templateUrl: './main-nav.component.html',
    styleUrls: ['./main-nav.component.scss'],
})
export class MainNavComponent implements OnInit, OnDestroy {
    user: User;
    destroy$: Subject<void> = new Subject();

    constructor(
        public authService: AuthService,
        private userService: UserService
    ) {
        this.userService.user
            .pipe(takeUntil(this.destroy$))
            .subscribe((user) => (this.user = user));
    }

    ngOnInit(): void {}

    ngOnDestroy() {
        this.destroy$.next();
    }
}
