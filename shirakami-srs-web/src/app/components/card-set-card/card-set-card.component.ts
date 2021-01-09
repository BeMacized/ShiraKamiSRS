import { Component, Input, OnInit } from '@angular/core';
import { SetEntity } from '../../models/set.model';

@Component({
    selector: 'app-card-set-card',
    templateUrl: './card-set-card.component.html',
    styleUrls: ['./card-set-card.component.scss'],
})
export class CardSetCardComponent implements OnInit {
    @Input()
    set: SetEntity;

    constructor() {}

    ngOnInit(): void {}
}
