export class SrsLevelEntity {
    level: number;
    lastUpdated: number;

    static fromDto(dto: SrsLevelDto): SrsLevelEntity {
        return Object.assign(new SrsLevelEntity(), {
            level: dto.level,
            lastUpdated: dto.lastUpdated,
        });
    }
}

export class SrsLevelDto {
    level: number;
    lastUpdated: number;
}
