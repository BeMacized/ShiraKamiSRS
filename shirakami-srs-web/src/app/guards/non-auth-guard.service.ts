import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { take } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class NonAuthGuardService implements CanActivate {
    constructor(private auth: AuthService, private router: Router) {}

    async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean> {
        if (await this.auth.loggedIn.pipe(take(1)).toPromise()) {
            this.router.navigate(['dashboard']);
            return false;
        }
        return true;
    }
}
