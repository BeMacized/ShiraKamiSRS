import { Injectable } from '@angular/core';
import { SetSrsStatusEntity } from '../models/set.model';
import { SrsGroup } from '../models/srs-group.model';

@Injectable({
    providedIn: 'root',
})
export class SrsService {
    public readonly srsGroups: SrsGroup[] = [
        {
            minLevel: 0,
            maxLevel: 3,
            name: 'Apprentice',
            bgColor: 'var(--color-srs-group-1)',
            fgColor: 'var(--color-on-srs-group-1)',
        },
        {
            minLevel: 4,
            maxLevel: 5,
            name: 'Guru',
            bgColor: 'var(--color-srs-group-2)',
            fgColor: 'var(--color-on-srs-group-2)',
        },
        {
            minLevel: 6,
            maxLevel: 6,
            name: 'Master',
            bgColor: 'var(--color-srs-group-3)',
            fgColor: 'var(--color-on-srs-group-3)',
        },
        {
            minLevel: 7,
            maxLevel: 7,
            name: 'Enlightened',
            bgColor: 'var(--color-srs-group-4)',
            fgColor: 'var(--color-on-srs-group-4)',
        },
        {
            minLevel: 8,
            maxLevel: 8,
            name: 'Burned',
            bgColor: 'var(--color-srs-group-5)',
            fgColor: 'var(--color-on-srs-group-5)',
        },
    ];
    constructor() {}

    getBgColorForLevel(level: number) {
        const group = this.srsGroups.find(
            (g) => level >= g.minLevel && level <= g.maxLevel
        );
        if (group) return group.bgColor;
        return 'transparent';
    }

    getFgColorForLevel(level: number) {
        const group = this.srsGroups.find(
            (g) => level >= g.minLevel && level <= g.maxLevel
        );
        if (group) return group.fgColor;
        return 'var(--color-on-surface)';
    }

    getLabelForLevel(level: number) {
        if (level <= -1) return 'Not learnt';
        const group = this.srsGroups.find(
            (g) => level >= g.minLevel && level <= g.maxLevel
        );
        if (group) return group.name;
        return 'Unknown';
    }

    getCountForGroup(groupId: number, srsStatus: SetSrsStatusEntity) {
        let count = 0;
        const group = this.srsGroups[groupId];
        for (let i = group.minLevel; i <= group.maxLevel; i++) {
            count += srsStatus.levelItems[`${i}`] || 0;
        }
        return count;
    }
}
