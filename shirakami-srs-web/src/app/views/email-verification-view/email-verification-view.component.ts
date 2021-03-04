import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { AppSettingsService } from '../../services/app-settings.service';
import { fadeUp } from '../../utils/animations';

type Status =
    | 'SUCCESS'
    | 'ALREADY_VERIFIED'
    | 'EMAIL_NO_MATCH'
    | 'UNKNOWN_ERROR'
    | 'TOKEN_EXPIRED'
    | 'MISSING_SIGNATURE'
    | 'INVALID_SIGNATURE'
    | 'TOKEN_MALFORMED';

@Component({
    selector: 'app-email-verified-view',
    templateUrl: './email-verification-view.component.html',
    styleUrls: ['./email-verification-view.component.scss'],
    animations: [fadeUp()],
})
export class EmailVerificationViewComponent implements OnInit {
    status: Status;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private appSettings: AppSettingsService
    ) {}

    async ngOnInit() {
        const query = await this.route.queryParams.pipe(take(1)).toPromise();
        if (query.token) {
            const apiBaseUrl = await this.appSettings.get<string>('apiBaseUrl');
            window.location.href = `${apiBaseUrl}/auth/verify?token=${query.token}`;
            return;
        }
        this.status = query.status;
        if (
            ![
                'SUCCESS',
                'ALREADY_VERIFIED',
                'EMAIL_NO_MATCH',
                'UNKNOWN_ERROR',
                'TOKEN_EXPIRED',
                'MISSING_SIGNATURE',
                'INVALID_SIGNATURE',
                'TOKEN_MALFORMED',
            ].includes(this.status)
        )
            await this.router.navigate(['login']);
    }
}
