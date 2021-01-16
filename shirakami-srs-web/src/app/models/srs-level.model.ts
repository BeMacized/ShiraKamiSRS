export class SrsLevelEntity {
    level: number;
    lastUpdated: Date;

    static fromDto(dto: SrsLevelDto): SrsLevelEntity {
        return Object.assign(new SrsLevelEntity(), {
            level: dto.level,
            lastUpdated: new Date(dto.lastUpdated * 1000),
        });
    }
}

export class SrsLevelDto {
    level: number;
    lastUpdated: number;
}
