import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuService } from '../../../services/menu.service';
import { User } from '../../../models/user.model';
import { takeUntil } from 'rxjs/operators';
import { UserService } from '../../../services/user.service';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-mobile-nav',
    templateUrl: './mobile-nav.component.html',
    styleUrls: ['./mobile-nav.component.scss'],
})
export class MobileNavComponent implements OnInit, OnDestroy {
    user: User;
    destroy$: Subject<void> = new Subject();

    constructor(
        public menuService: MenuService,
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
