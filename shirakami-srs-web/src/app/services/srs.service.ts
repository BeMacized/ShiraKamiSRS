import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SrsService {
    public readonly srsGroupLabels: string[] = [
        'Apprentice',
        'Guru',
        'Master',
        'Enlightened',
        'Burned',
    ];
    constructor() {}

    getBgColorForLevel(level: number) {
        if (level >= 0 && level <= 3) return 'var(--color-srs-group-1)';
        if (level >= 4 && level <= 5) return 'var(--color-srs-group-2)';
        if (level === 6) return 'var(--color-srs-group-3)';
        if (level === 7) return 'var(--color-srs-group-4)';
        if (level === 8) return 'var(--color-srs-group-5)';
        return 'transparent';
    }

    getFgColorForLevel(level: number) {
        if (level >= 0 && level <= 3) return 'var(--color-on-srs-group-1)';
        if (level >= 4 && level <= 5) return 'var(--color-on-srs-group-2)';
        if (level === 6) return 'var(--color-on-srs-group-3)';
        if (level === 7) return 'var(--color-on-srs-group-4)';
        if (level === 8) return 'var(--color-on-srs-group-5)';
        return 'var(--color-on-surface)';
    }

    getLabelForLevel(level: number) {
        if (level <= -1) return 'Not learnt';
        if (level >= 0 && level <= 3) return this.srsGroupLabels[0];
        if (level >= 4 && level <= 5) return this.srsGroupLabels[1];
        if (level === 6) return this.srsGroupLabels[2];
        if (level === 7) return this.srsGroupLabels[3];
        if (level === 8) return this.srsGroupLabels[4];
        return 'Unknown';
    }
}
