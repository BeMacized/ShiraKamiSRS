import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ServiceError } from '../../models/service-error.model';
import { OperationStatus } from '../../models/operation-status.model';
import { fadeUp, hshrink, vshrink } from '../../utils/animations';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppSettingsService } from '../../services/app-settings.service';

type Mode =
    | 'LOGIN'
    | 'REGISTER'
    | 'VERIFY_EMAIL'
    | 'ACCOUNT_CREATED'
    | 'FORGOT_PASSWORD';

@Component({
    selector: 'app-login-view',
    templateUrl: './login-view.component.html',
    styleUrls: ['./login-view.component.scss'],
    animations: [vshrink(), hshrink(), fadeUp()],
})
export class LoginViewComponent implements OnInit {
    mode: Mode = 'LOGIN';
    enablePasswordResets = false;

    loginError: string;
    resetError: string;
    registerError: string;

    loginStatus: OperationStatus = 'IDLE';
    resetStatus: OperationStatus = 'IDLE';
    registerStatus: OperationStatus = 'IDLE';

    loginForm: FormGroup = new FormGroup({
        email: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required]),
    });
    resetForm: FormGroup = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]),
    });
    registerForm: FormGroup = new FormGroup(
        {
            username: new FormControl('', [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(32),
                Validators.pattern('^[a-zA-Z0-9-_]+$'),
            ]),
            email: new FormControl('', [Validators.required, Validators.email]),
            password: new FormControl('', [
                Validators.required,
                Validators.minLength(6),
                Validators.maxLength(32),
            ]),
            passwordConfirm: new FormControl('', []),
        },
        {
            validators: (group) =>
                group.get('password').value ===
                group.get('passwordConfirm').value
                    ? null
                    : { passwordNoMatch: true },
        }
    );

    constructor(
        public themeService: ThemeService,
        public appSettingsService: AppSettingsService,
        private auth: AuthService,
        private router: Router
    ) {}

    async ngOnInit() {
        this.enablePasswordResets = await this.appSettingsService.get<boolean>(
            'enablePasswordResets'
        );
    }

    async onLoginClick() {
        if (
            !['IDLE', 'ERROR'].includes(this.loginStatus) ||
            this.loginForm.invalid
        )
            return;
        this.loginError = null;
        this.loginStatus = 'IN_PROGRESS';
        try {
            await this.auth.login(
                this.loginForm.value.email,
                this.loginForm.value.password
            );
            this.loginStatus = 'SUCCESS';
            setTimeout(() => {
                this.router.navigate(['dashboard']);
            }, 1000);
        } catch (e) {
            this.loginStatus = 'ERROR';
            if (e instanceof ServiceError) {
                switch (e.code) {
                    case 'RATE_LIMITED':
                        this.loginError =
                            'There have been too many login attempts from your address. Please try again later.';
                        return;
                    case 'INVALID_CREDENTIALS':
                        this.loginError =
                            'The provided credentials are invalid.';
                        return;
                    case 'EMAIL_NOT_VERIFIED':
                        this.loginError =
                            'Your account has not yet been activated. Please activate your account by clicking the link in the verification e-mail.';
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

    async onRegisterClick() {
        if (
            !['IDLE', 'ERROR'].includes(this.registerStatus) ||
            this.registerForm.invalid
        )
            return;
        this.registerError = null;
        this.registerStatus = 'IN_PROGRESS';
        try {
            const { email, username, password } = this.registerForm.value;
            const { needsEmailVerification } = await this.auth.register(
                email,
                username,
                password
            );
            this.registerStatus = 'SUCCESS';
            setTimeout(() => {
                this.setMode(
                    needsEmailVerification ? 'VERIFY_EMAIL' : 'ACCOUNT_CREATED'
                );
            }, 1000);
        } catch (e) {
            this.registerStatus = 'ERROR';
            if (e instanceof ServiceError) {
                switch (e.code) {
                    case 'RATE_LIMITED':
                        this.registerError =
                            'There have been too many sign up attempts from your address. Please try again later.';
                        return;
                    case 'MAILER_FAILED':
                        this.registerError =
                            'The verification email could not be sent. Please contact an administrator.';
                        return;
                    case 'INVALID_REGISTRATION_DATA':
                        this.registerError =
                            'The provided registration information is invalid.';
                        return;
                    case 'EMAIL_EXISTS':
                        this.registerError =
                            'An account with this email address already exists.';
                        return;
                    case 'USERNAME_USED_TOO_OFTEN':
                        this.registerError =
                            'This username has been used too often. Please pick something else.';
                        return;
                    case 'SERVICE_UNAVAILABLE':
                        this.registerError =
                            'The server was unavailable. Please try again later.';
                        return;
                }
            }
            this.loginError = 'An unknown error occurred.';
            console.error(e);
        }
    }

    setMode(mode: Mode) {
        this.mode = mode;
        this.registerStatus = 'IDLE';
        this.loginStatus = 'IDLE';
        this.resetStatus = 'IDLE';
        this.loginForm.reset();
        this.registerForm.reset();
        this.resetForm.reset();
    }

    showForInvalid(registerForm: FormGroup, controlName: string) {
        const control = registerForm.get(controlName);
        return control.invalid && (control.dirty || control.touched);
    }

    async onResetClick() {
        if (this.resetStatus === 'IN_PROGRESS' || this.resetForm.invalid)
            return;
        this.resetError = null;
        this.resetStatus = 'IN_PROGRESS';
        try {
            const { email } = this.resetForm.value;
            await this.auth.resetPassword(email);
            this.resetStatus = 'SUCCESS';
        } catch (e) {
            this.resetStatus = 'ERROR';
            if (e instanceof ServiceError) {
                switch (e.code) {
                    case 'RATE_LIMITED':
                        this.resetError =
                            'There have been too many password reset requests from your address. Please try again later.';
                        return;
                    case 'MAILER_FAILED':
                        this.resetError =
                            'The password reset email could not be sent. Please contact an administrator.';
                        return;
                    case 'SERVICE_UNAVAILABLE':
                        this.resetError =
                            'The server was unavailable. Please try again later.';
                        return;
                }
            }
            this.resetError = 'An unknown error occurred.';
            console.error(e);
        }
    }
}
