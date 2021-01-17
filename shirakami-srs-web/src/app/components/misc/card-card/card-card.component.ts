import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CardEntity } from '../../../models/card.model';
import { SrsService } from '../../../services/srs.service';
import { ReviewMode } from '../../../models/review.model';

@Component({
    selector: 'app-card-card',
    templateUrl: './card-card.component.html',
    styleUrls: ['./card-card.component.scss'],
})
export class CardCardComponent implements OnInit {
    @Input() card: CardEntity;

    @Output()
    edit: EventEmitter<void> = new EventEmitter<void>();
    @Output()
    remove: EventEmitter<void> = new EventEmitter<void>();

    constructor(private srsService: SrsService) {}

    ngOnInit(): void {}

    getSrsLevel(mode: ReviewMode) {
        return (
            this.card?.reviews?.find((r) => r.mode === mode)?.currentLevel || -1
        );
    }

    getSrsLevelLabel(level: number) {
        return this.srsService.getLabelForLevel(level);
    }

    getSrsLevelStyles(level: number) {
        return {
            '--srs-bg-color': this.srsService.getBgColorForLevel(level),
            '--srs-color': this.srsService.getFgColorForLevel(level),
        };
    }
}
