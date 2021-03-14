import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { fadeUp, hshrink, vshrink } from '../../utils/animations';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OperationStatus } from '../../models/operation-status.model';
import { ServiceError } from '../../models/service-error.model';
import { AuthService } from '../../services/auth.service';

type Mode = 'INIT' | 'IDLE' | 'TOKEN_EXPIRED' | 'SUCCESS';

@Component({
    selector: 'app-password-reset-view',
    templateUrl: './password-reset-view.component.html',
    styleUrls: ['./password-reset-view.component.scss'],
    animations: [fadeUp(), vshrink(), hshrink()],
})
export class PasswordResetViewComponent implements OnInit {
    token: string;
    mode: Mode = 'INIT';
    resetStatus: OperationStatus = 'IDLE';
    resetError: string;
    resetForm: FormGroup = new FormGroup(
        {
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
        private route: ActivatedRoute,
        private router: Router,
        private auth: AuthService
    ) {}

    async ngOnInit() {
        const query = await this.route.queryParams.pipe(take(1)).toPromise();
        if (!query.token) {
            await this.router.navigate(['login']);
            return;
        }
        this.token = query.token;
        const { exp } = jwt_decode(this.token) as any;
        if (Date.now() / 1000 >= exp) {
            this.mode = 'TOKEN_EXPIRED';
        } else {
            this.mode = 'IDLE';
            setTimeout(() => {
                if (this.mode === 'IDLE') this.mode = 'TOKEN_EXPIRED';
            }, exp * 1000 - Date.now());
        }
    }

    showForInvalid(form: FormGroup, controlName: string) {
        const control = form.get(controlName);
        return control.invalid && (control.dirty || control.touched);
    }

    async onResetClick() {
        if (
            this.mode !== 'IDLE' ||
            !['IDLE', 'ERROR'].includes(this.resetStatus) ||
            this.resetForm.invalid
        )
            return;
        this.resetError = null;
        this.resetStatus = 'IN_PROGRESS';
        try {
            const { password } = this.resetForm.value;
            await this.auth.submitPasswordReset(this.token, password);
            this.resetStatus = 'SUCCESS';
            setTimeout(() => (this.mode = 'SUCCESS'), 1000);
        } catch (e) {
            this.resetStatus = 'ERROR';
            if (e instanceof ServiceError) {
                switch (e.code) {
                    case 'TOKEN_EXPIRED':
                        this.mode = 'TOKEN_EXPIRED';
                        return;
                    case 'MISSING_SIGNATURE':
                    case 'INVALID_SIGNATURE':
                    case 'TOKEN_MALFORMED':
                        this.resetError =
                            'You cannot reset your password with this link, as the included token was deemed invalid.';
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
