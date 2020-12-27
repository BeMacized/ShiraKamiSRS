import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
    selector: 'app-login-view',
    templateUrl: './login-view.component.html',
    styleUrls: ['./login-view.component.scss'],
})
export class LoginViewComponent implements OnInit {
    constructor(public themeService: ThemeService) {}

    ngOnInit(): void {}
}
