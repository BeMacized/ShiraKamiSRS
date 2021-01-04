import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ServiceError } from '../../models/service-error.model';
import { OperationStatus } from '../../models/operation-status.model';
import { vshrink } from '../../utils/animations';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login-view',
    templateUrl: './login-view.component.html',
    styleUrls: ['./login-view.component.scss'],
    animations: [vshrink()],
})
export class LoginViewComponent implements OnInit {
    email: string;
    password: string;
    loginError: string;
    loginStatus: OperationStatus = 'IDLE';

    constructor(
        public themeService: ThemeService,
        private auth: AuthService,
        private router: Router
    ) {}

    ngOnInit(): void {}

    async onFormSubmit() {
        if (!['IDLE', 'ERROR'].includes(this.loginStatus)) return;
        this.loginError = null;
        this.loginStatus = 'IN_PROGRESS';
        try {
            await this.auth.login(this.email, this.password);
            this.loginStatus = 'SUCCESS';
            setTimeout(() => {
                this.router.navigate(['dashboard']);
            }, 1000);
        } catch (e) {
            this.loginStatus = 'ERROR';
            if (e instanceof ServiceError) {
                switch (e.code) {
                    case 'INVALID_CREDENTIALS':
                        this.loginError =
                            'The provided credentials are invalid.';
                        return;
                    case 'SERVICE_UNAVAILABLE':
                        this.loginError =
                            'The server was unavailable. Please try again later.';
                        return;
                }
            }
            this.loginError = 'An unknown error occurred.';
            console.error(e);
        }
    }
}
