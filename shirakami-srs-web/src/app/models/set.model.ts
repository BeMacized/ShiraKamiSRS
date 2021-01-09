export type SetMode = 'enToJp' | 'jpToEn' | 'kanjiToKana';

export class SetEntity {
    id: string;
    name: string;
    modes: SetMode[];
    userId: string;

    static fromDto(dto: SetDto): SetEntity {
        return Object.assign(new SetEntity(), {
            id: dto.id,
            userId: dto.userId,
            name: dto.name,
            modes: dto.modes,
        });
    }
}

export class CreateSetDto {
    name: string;
    modes: SetMode[];
}

export class UpdateSetDto extends CreateSetDto {
    id: string;
    userId: string;
}

export class SetDto extends UpdateSetDto {
    // cards?: CardDto[];
}
