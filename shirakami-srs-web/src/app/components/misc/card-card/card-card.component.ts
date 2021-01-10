import { Component, Input, OnInit } from '@angular/core';
import { CardEntity } from '../../../models/card.model';
import { SrsService } from '../../../services/srs.service';

@Component({
    selector: 'app-card-card',
    templateUrl: './card-card.component.html',
    styleUrls: ['./card-card.component.scss'],
})
export class CardCardComponent implements OnInit {
    @Input() card: CardEntity;

    constructor(private srsService: SrsService) {
        this.card = {
            id: 'uuid',
            setId: 'uuid',
            value: {
                english: 'Food Sample',
                kana: 'ししょく',
                kanji: '試食',
            },
            srsLevelJpToEn: {
                level: -1,
                lastUpdated: 0,
            },
            srsLevelEnToJp: {
                level: 0,
                lastUpdated: 0,
            },
            srsLevelKanjiToKana: {
                level: 5,
                lastUpdated: 0,
            },
        };
    }

    ngOnInit(): void {}

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
